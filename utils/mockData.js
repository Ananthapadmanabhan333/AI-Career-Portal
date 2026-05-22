const Job = require('../models/Job');

const preseededJobs = [
  {
    title: 'AI Integration Engineering Intern',
    company: 'Cognifyz Technologies',
    description: 'Join our cutting-edge AI labs to integrate LLM workflows, create robust backend integrations, and design responsive glassmorphic frontend UI systems. You will gain extensive exposure to practical Node.js development, RESTful design, and API architectures.',
    requirements: [
      'Strong knowledge of Node.js and Express.js framework APIs.',
      'Familiarity with MongoDB, Mongoose schemas, and relational database designs.',
      'Basic understanding of LLMs (Gemini/OpenAI) and how to prompt-engineer API responses.',
      'Experience with responsive HTML5/CSS3 and modern client-side layouts.'
    ],
    location: 'Remote (India)',
    salary: '₹15,000 - ₹25,000 / month',
    type: 'Internship',
    category: 'AI & Data Science'
  },
  {
    title: 'Junior Front-End Developer',
    company: 'Innovate Tech Labs',
    description: 'We are seeking a talented frontend engineer to elevate user interfaces to the next level. You will work extensively with Bootstrap 5, custom vanilla CSS animation states, responsive dashboard panels, and DOM interaction components.',
    requirements: [
      'Proficiency in semantic HTML5, CSS custom properties, and grid systems.',
      'Strong JavaScript core skills (ES6+, DOM Manipulation, Async/Await fetches).',
      'Understanding of progressive design aesthetics, including Glassmorphism and responsive sidebars.',
      'Git collaboration and version control exposure.'
    ],
    location: 'Bangalore, KA',
    salary: '₹35,000 - ₹45,000 / month',
    type: 'Full-time',
    category: 'Software Development'
  },
  {
    title: 'Full Stack Developer Intern',
    company: 'CloudScale Solutions',
    description: 'A hands-on opportunity to touch every layer of an active SaaS application. From designing protected Express router endpoints to scaling database queries and implementing secure cookie-based JWT sessions.',
    requirements: [
      'Full Stack familiarity: HTML/CSS frontend and Node.js backend.',
      'Understanding of MongoDB Mongoose querying and document manipulation.',
      'Familiarity with security concepts like hashing, bcrypt, and JSON Web Tokens.',
      'Willingness to learn, debug quickly, and write clean, modular MVC files.'
    ],
    location: 'Hyderabad (Hybrid)',
    salary: '₹20,000 / month',
    type: 'Internship',
    category: 'Software Development'
  },
  {
    title: 'Data Science & Machine Learning Intern',
    company: 'MetricsGen Studio',
    description: 'Analyze data streams, design ML dashboards, and support resume parsers. You will be responsible for creating reliable analytics engines, extracting structural metrics, and displaying interactive statistics on dashboard visualizers.',
    requirements: [
      'Strong Python core skills and data manipulation packages.',
      'Basic knowledge of SQL/NoSQL structure and REST endpoint integration.',
      'Eager interest in analytical layouts, tables, and automated report generators.',
      'Strong communication and research skills.'
    ],
    location: 'Remote',
    salary: '₹18,000 / month',
    type: 'Internship',
    category: 'AI & Data Science'
  }
];

/**
 * Automatically seeds the database with mock jobs if no jobs exist.
 * This guarantees the application is interactive immediately.
 */
const seedMockJobs = async () => {
  try {
    const jobCount = await Job.countDocuments();
    if (jobCount === 0) {
      console.log('[Data Seed] No jobs found in database. Seeding mock job boards...');
      await Job.insertMany(preseededJobs);
      console.log('[Data Seed] Mock internships successfully seeded!');
    } else {
      console.log('[Data Seed] Job board populated. Skipping seed phase.');
    }
  } catch (error) {
    console.error(`[Data Seed Error] Failed to preseed database: ${error.message}`);
  }
};

module.exports = {
  seedMockJobs
};
