const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

/**
 * Serves aggregated counts and analytics for dashboard visualizers.
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const jobSeekerCount = await User.countDocuments({ role: 'Job Seeker' });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    // Aggregated distributions for applications
    const statusCounts = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Average AI score calculations
    const scoreStats = await Application.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$aiScore' } } }
    ]);

    const stats = {
      users: jobSeekerCount,
      jobs: totalJobs,
      applications: totalApplications,
      averageAiScore: scoreStats[0] ? Math.round(scoreStats[0].avgScore) : 0,
      distribution: statusCounts.reduce((acc, current) => {
        acc[current._id] = current.count;
        return acc;
      }, { Applied: 0, Reviewing: 0, Shortlisted: 0, Rejected: 0 })
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error(`[API Stats Error] Failed to aggregate metrics: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
