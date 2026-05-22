const { GoogleGenAI } = require('@google/generative-ai');

let model = null;
let useMockAI = false;

// Attempt to initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'your_gemini_api_key_here') {
  console.warn('[AI Service Warning] GEMINI_API_KEY is not set. AI features will run in Heuristic Simulator Mode.');
  useMockAI = true;
} else {
  try {
    // Standard initialization for @google/generative-ai
    const genAI = new GoogleGenAI({ apiKey });
    // Using fast, lightweight model for resume critique
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('[AI Service] Google Gemini API Client initialized successfully.');
  } catch (error) {
    console.error(`[AI Service Error] Failed to initialize Gemini client: ${error.message}`);
    useMockAI = true;
  }
}

/**
 * Perform Resume Analysis using Gemini AI (or Heuristic offline parser if mock mode is active)
 * @param {string} resumeText - The parsed textual content of the resume
 * @param {string} jobDescription - Optional target job role or description
 * @returns {Promise<object>} Parsed feedback object
 */
const analyzeResume = async (resumeText, jobDescription = '') => {
  if (useMockAI || !model) {
    return runHeuristicSimulator(resumeText, jobDescription);
  }

  try {
    const prompt = `
      You are an expert AI Applicant Tracking System (ATS) and Career Coach. 
      Analyze the following resume text and compare it with the desired job/role context: "${jobDescription}".
      
      Resume content:
      """
      ${resumeText}
      """
      
      Respond STRICTLY with a JSON object. Do not include any markdown fences or formatting code blocks outside of raw JSON.
      The JSON structure MUST be exactly:
      {
        "score": 85, // Integer rating from 0 to 100
        "skillsIdentified": ["Skill A", "Skill B"], // Array of strings representing core skills found
        "gapAnalysis": "Short paragraph outlining missing skills or qualifications",
        "careerSuggestions": ["Career Path 1", "Career Path 2", "Career Path 3"], // Exactly 3 distinct career paths
        "actionableRecommendations": ["Improve action verbs in section X", "Add certification Y"] // Array of concrete improvements
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text().trim();
    
    // Parse JSON safely from output, stripping any markdown wrappers if generated
    const cleanJSONText = rawText
      .replace(/^```json/i, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    return JSON.parse(cleanJSONText);
  } catch (error) {
    console.error(`[Gemini API Error] Failed to generate AI analysis: ${error.message}`);
    console.warn('[AI Service] Falling back to local Heuristic Simulator due to API error.');
    return runHeuristicSimulator(resumeText, jobDescription);
  }
};

/**
 * Offline Heuristic Simulator that scans resume text for keywords and generates structured feedback.
 * This guarantees the application is fully functional offline and submission-ready even without a billing key.
 */
function runHeuristicSimulator(resumeText, jobDescription = '') {
  const normalizedText = resumeText.toLowerCase();
  
  // Basic skill dictionary mapping keywords
  const skillKeywords = {
    javascript: 'JavaScript',
    node: 'Node.js',
    react: 'React',
    express: 'Express.js',
    mongodb: 'MongoDB',
    python: 'Python',
    bootstrap: 'Bootstrap 5',
    css: 'CSS3',
    html: 'HTML5',
    git: 'Git/GitHub',
    sql: 'SQL Database',
    aws: 'Amazon Web Services',
    docker: 'Docker',
    typescript: 'TypeScript'
  };

  const identified = [];
  for (const [key, value] of Object.entries(skillKeywords)) {
    if (normalizedText.includes(key)) {
      identified.push(value);
    }
  }

  // Fallbacks if no keywords matched
  if (identified.length === 0) {
    identified.push('General IT', 'Problem Solving', 'Communication');
  }

  // Calculate a dynamic score based on keyword densities and word count
  const wordCount = resumeText.split(/\s+/).length;
  let score = 55; // Base score
  score += Math.min(identified.length * 4, 25); // Skill density
  score += Math.min(Math.floor(wordCount / 20), 15); // Length bonus
  score = Math.min(Math.max(score, 10), 98); // Bounds

  const careerSuggestions = [
    'Associate Software Engineer (Full Stack)',
    'Frontend Developer (React/UI)',
    'Backend Engineer (Express/Node.js)'
  ];

  if (jobDescription) {
    careerSuggestions.unshift(`${jobDescription} Professional`);
  }

  return {
    score,
    skillsIdentified: identified,
    gapAnalysis: `The resume shows solid exposure to ${identified.slice(0, 3).join(', ')}. To stand out, consider integrating explicit certifications, system architecture diagrams, or cloud deployments in your profile.`,
    careerSuggestions: careerSuggestions.slice(0, 3),
    actionableRecommendations: [
      'Quantify your impact using the STAR method (Situation, Task, Action, Result).',
      `Add advanced keywords such as ${identified.includes('Docker') ? 'Kubernetes' : 'Docker/DevOps'} to align with standard ATS protocols.`,
      'Include links to active live projects and Git repositories in your contact section.'
    ]
  };
}

module.exports = {
  analyzeResume
};
