const User = require('../models/User');
const Interview = require('../models/Interview');
const Shortlist = require('../models/Shortlist');

exports.getOverview = async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied. Admins only.' });

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalInterviews = await Interview.countDocuments();
    const completedInterviews = await Interview.countDocuments({ status: 'completed' });
    const totalShortlists = await Shortlist.countDocuments();

    const completed = await Interview.find({ status: 'completed' }).select('feedback.score');
    const avgScore = completed.length > 0
      ? Math.round(completed.reduce((a, b) => a + (b.feedback?.score || 0), 0) / completed.length)
      : 0;

    res.json({
      totalStudents,
      totalRecruiters,
      totalInterviews,
      completedInterviews,
      totalShortlists,
      avgScore
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getScoreDistribution = async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied.' });

    const interviews = await Interview.find({ status: 'completed' }).select('feedback.score');

    const buckets = { '0-40': 0, '40-60': 0, '60-75': 0, '75-90': 0, '90-100': 0 };

    interviews.forEach(iv => {
      const score = iv.feedback?.score || 0;
      if (score < 40) buckets['0-40']++;
      else if (score < 60) buckets['40-60']++;
      else if (score < 75) buckets['60-75']++;
      else if (score < 90) buckets['75-90']++;
      else buckets['90-100']++;
    });

    const data = Object.entries(buckets).map(([range, count]) => ({ range, count }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getDailyTrend = async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied.' });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const interviews = await Interview.find({
      createdAt: { $gte: sevenDaysAgo }
    }).select('createdAt');

    const dayCounts = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      dayCounts[key] = 0;
    }

    interviews.forEach(iv => {
      const key = new Date(iv.createdAt).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      if (dayCounts[key] !== undefined) dayCounts[key]++;
    });

    const data = Object.entries(dayCounts).map(([date, count]) => ({ date, count }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getCompanyPopularity = async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied.' });

    const interviews = await Interview.find({ company: { $ne: null } }).select('company');

    const counts = {};
    interviews.forEach(iv => {
      const c = iv.company || 'unknown';
      counts[c] = (counts[c] || 0) + 1;
    });

    const data = Object.entries(counts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getDomainPopularity = async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied.' });

    const interviews = await Interview.find().select('domain');

    const counts = {};
    interviews.forEach(iv => {
      const d = iv.domain || 'General';
      counts[d] = (counts[d] || 0) + 1;
    });

    const data = Object.entries(counts).map(([domain, count]) => ({ domain, count }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTopStudents = async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied.' });

    const students = await User.find({ role: 'student' }).select('name email');

    const results = await Promise.all(students.map(async (student) => {
      const interviews = await Interview.find({
        student: student._id,
        status: 'completed'
      }).select('feedback.score');

      const scores = interviews.map(i => i.feedback?.score || 0);
      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

      return {
        name: student.name,
        email: student.email,
        totalInterviews: interviews.length,
        avgScore
      };
    }));

    const top = results
      .filter(r => r.totalInterviews > 0)
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    res.json(top);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};