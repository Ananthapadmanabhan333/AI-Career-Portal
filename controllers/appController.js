const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { analyzeResume } = require('../config/ai');

// Configure Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads');
    
    // Ensure destination directory exists recursively
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name keeping original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter accepting PDFs and standard text resumes
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only resumes in PDF or plain TXT format are permitted'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

/**
 * Handle application submission and initiate Gemini AI Resume critiques
 */
const submitApplication = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a resume file (.pdf or .txt)' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job position not found' });
    }

    // Check if user has already applied to this specific job
    const alreadyApplied = await Application.findOne({ user: req.user._id, job: jobId });
    if (alreadyApplied) {
      // Clean up uploaded file since it is redundant
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'You have already applied for this position.' });
    }

    let resumeText = '';
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    // Parse resume content based on file type
    if (fileExtension === '.pdf') {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        const parsedPDF = await pdfParse(fileBuffer);
        resumeText = parsedPDF.text;
      } catch (pdfError) {
        console.error(`[PDF Parsing Error] Failed to parse file: ${pdfError.message}`);
        resumeText = `Fallback parsing: Resume file name is ${req.file.originalname}`;
      }
    } else {
      // Read TXT file directly
      resumeText = fs.readFileSync(filePath, 'utf-8');
    }

    // If parsing yielded empty string, set fallback
    if (!resumeText || resumeText.trim().length === 0) {
      resumeText = `Standard Application. Applied with file ${req.file.originalname}. Skills matching: JavaScript, CSS.`;
    }

    console.log(`[AI Queue] Triggering Gemini resume critique for candidate: ${req.user.username}`);
    
    // Call Gemini AI analysis with job contexts
    const aiCritique = await analyzeResume(resumeText, `${job.title} at ${job.company}`);

    // Create Application entry in database
    const application = await Application.create({
      user: req.user._id,
      job: jobId,
      resumeUrl: `/uploads/${path.basename(filePath)}`,
      resumeOriginalName: req.file.originalname,
      status: 'Applied',
      aiScore: aiCritique.score || 70,
      aiAnalysis: {
        skillsIdentified: aiCritique.skillsIdentified || [],
        gapAnalysis: aiCritique.gapAnalysis || 'N/A',
        careerSuggestions: aiCritique.careerSuggestions || [],
        actionableRecommendations: aiCritique.actionableRecommendations || []
      }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted and analyzed by AI successfully!',
      data: application
    });
  } catch (error) {
    console.error(`[Application Submission Error] ${error.message}`);
    // Safe unlink if file was written but DB creation failed
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    next(error);
  }
};

/**
 * Fetch all applications submitted by the logged-in User
 */
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate('job')
      .sort({ appliedAt: -1 });

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error(`[Application Controller Error] getMyApplications failed: ${error.message}`);
    next(error);
  }
};

module.exports = {
  upload,
  submitApplication,
  getMyApplications
};
