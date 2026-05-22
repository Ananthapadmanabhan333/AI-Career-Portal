const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: {
    type: [String],
    required: [true, 'Requirements are required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  salary: {
    type: String,
    default: 'Unpaid / Stipend details undisclosed'
  },
  type: {
    type: String,
    enum: ['Internship', 'Full-time', 'Part-time', 'Remote'],
    default: 'Internship'
  },
  category: {
    type: String,
    default: 'Software Development'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', JobSchema);
