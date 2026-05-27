const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'] },
  content: { type: String, required: true }
});

const interviewSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },        // e.g. "Frontend Developer"
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  domain: { type: String, default: 'general' },  // e.g. "DSA", "HR", "System Design"
  messages: [messageSchema],
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
  feedback: {
    score: Number,
    strengths: [String],
    improvements: [String],
    summary: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interview', interviewSchema);