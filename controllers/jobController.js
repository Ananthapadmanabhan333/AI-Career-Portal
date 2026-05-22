const Job = require('../models/Job');
const cacheService = require('../utils/cache');

/**
 * Get all available jobs (Supports search filter & utilizes custom TTL cache)
 */
const getAllJobs = async (req, res, next) => {
  const searchQuery = req.query.search || '';
  const cacheKey = `jobs_search_${searchQuery}`;

  try {
    // Attempt cache fetch
    const cachedJobs = cacheService.get(cacheKey);
    if (cachedJobs) {
      return res.status(200).json({ success: true, source: 'cache', data: cachedJobs });
    }

    let filter = {};
    if (searchQuery) {
      filter = {
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { company: { $regex: searchQuery, $options: 'i' } },
          { category: { $regex: searchQuery, $options: 'i' } }
        ]
      };
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 });

    // Store in cache for 60 seconds
    cacheService.set(cacheKey, jobs, 60);

    res.status(200).json({ success: true, source: 'database', data: jobs });
  } catch (error) {
    console.error(`[Job Controller Error] getAllJobs failed: ${error.message}`);
    next(error);
  }
};

/**
 * Get single job details
 */
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job/Internship position not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error(`[Job Controller Error] getJobById failed: ${error.message}`);
    next(error);
  }
};

/**
 * Create a new job posting (Recruiters & Admins only)
 */
const createJob = async (req, res, next) => {
  const { title, company, description, requirements, location, salary, type, category } = req.body;

  try {
    const parsedRequirements = Array.isArray(requirements)
      ? requirements
      : requirements.split(',').map(r => r.trim()).filter(r => r.length > 0);

    const job = await Job.create({
      title,
      company,
      description,
      requirements: parsedRequirements,
      location,
      salary,
      type,
      category,
      postedBy: req.user._id
    });

    // Invalidate jobs search cache
    cacheService.clear();

    res.status(201).json({ success: true, message: 'Job posting created successfully', data: job });
  } catch (error) {
    console.error(`[Job Controller Error] createJob failed: ${error.message}`);
    next(error);
  }
};

/**
 * Delete a job posting
 */
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Role protection verification
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this posting' });
    }

    await Job.findByIdAndDelete(req.params.id);
    cacheService.clear(); // Flush cache

    res.status(200).json({ success: true, message: 'Job posting deleted successfully' });
  } catch (error) {
    console.error(`[Job Controller Error] deleteJob failed: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  deleteJob
};
