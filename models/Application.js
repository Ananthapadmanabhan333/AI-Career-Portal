const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  resumeUrl: {
    type: String,
    required: [true, 'Resume file is required']
  },
  resumeOriginalName: {
    type: String,
    default: 'resume.pdf'
  },
  status: {
    type: String,
    enum: ['Applied', 'Reviewing', 'Shortlisted', 'Rejected'],
    default: 'Applied'
  },
  aiScore: {
    type: Number,
    default: 0
  },
  aiAnalysis: {
    skillsIdentified: [String],
    gapAnalysis: String,
    careerSuggestions: [String],
    actionableRecommendations: [String]
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Application', ApplicationSchema);
