const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const appController = require('../controllers/appController');
const apiController = require('../controllers/apiController');
const { protect, requireRole } = require('../middleware/authMiddleware');

/**
 * ==========================================
 * PUBLIC ENDPOINTS
 * ==========================================
 */
router.get('/jobs', jobController.getAllJobs);
router.get('/jobs/:id', jobController.getJobById);

/**
 * ==========================================
 * PROTECTED ENDPOINTS (Authenticated Users)
 * ==========================================
 */
router.use(protect);

// Dashboard Statistics Telemetry
router.get('/stats', apiController.getDashboardStats);

// Applications Routes
router.get('/applications/me', appController.getMyApplications);
router.post(
  '/applications', 
  requireRole('Job Seeker'), 
  appController.upload.single('resume'), 
  appController.submitApplication
);

/**
 * ==========================================
 * RECRUITER / ADMIN ONLY ENDPOINTS
 * ==========================================
 */
router.post('/jobs', requireRole('Recruiter', 'Admin'), jobController.createJob);
router.delete('/jobs/:id', requireRole('Recruiter', 'Admin'), jobController.deleteJob);

module.exports = router;
