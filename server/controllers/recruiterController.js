const User = require('../models/User');
const Interview = require('../models/Interview');
const Shortlist = require('../models/Shortlist');

// Get all students with their interview stats
exports.getAllStudents = async (req, res) => {
  try {
    if (req.user.role !== 'recruiter')
      return res.status(403).json({ message: 'Access denied. Recruiters only.' });

    const students = await User.find({ role: 'student' }).select('-password');

    const studentsWithStats = await Promise.all(students.map(async (student) => {
      const interviews = await Interview.find({
        student: student._id,
        status: 'completed'
      }).select('role domain difficulty feedback createdAt');

      const scores = interviews.map(i => i.feedback?.score || 0);
      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;
      const bestScore = scores.length > 0 ? Math.max(...scores) : null;

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        totalInterviews: interviews.length,
        avgScore,
        bestScore,
        recentInterviews: interviews.slice(0, 3)
      };
    }));

    // Sort by avgScore descending
    studentsWithStats.sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));

    res.json(studentsWithStats);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single student full detail
exports.getStudentDetail = async (req, res) => {
  try {
    if (req.user.role !== 'recruiter')
      return res.status(403).json({ message: 'Access denied.' });

    const student = await User.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const interviews = await Interview.find({
      student: req.params.id,
      status: 'completed'
    }).sort({ createdAt: -1 });

    const isShortlisted = await Shortlist.findOne({
      recruiter: req.user._id,
      student: req.params.id
    });

    res.json({ student, interviews, isShortlisted: !!isShortlisted });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Shortlist / unshortlist a student
exports.shortlistStudent = async (req, res) => {
  try {
    if (req.user.role !== 'recruiter')
      return res.status(403).json({ message: 'Access denied.' });

    const existing = await Shortlist.findOne({
      recruiter: req.user._id,
      student: req.params.studentId
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({ shortlisted: false, message: 'Removed from shortlist' });
    }

    await Shortlist.create({
      recruiter: req.user._id,
      student: req.params.studentId,
      note: req.body?.note || ''  // ← ?. add kiya
    });

    res.json({ shortlisted: true, message: 'Added to shortlist ⭐' });

  } catch (err) {
    console.error('shortlist error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all shortlisted students
exports.getShortlisted = async (req, res) => {
  try {
    if (req.user.role !== 'recruiter')
      return res.status(403).json({ message: 'Access denied.' });

    const shortlists = await Shortlist.find({ recruiter: req.user._id })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    const result = await Promise.all(shortlists.map(async (s) => {
      const interviews = await Interview.find({
        student: s.student._id,
        status: 'completed'
      }).select('feedback role');

      const scores = interviews.map(i => i.feedback?.score || 0);
      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;

      return {
        _id: s._id,
        student: s.student,
        note: s.note,
        avgScore,
        totalInterviews: interviews.length,
        shortlistedAt: s.createdAt
      };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.compareStudents = async (req, res) => {
  try {
    if (req.user.role !== 'recruiter')
      return res.status(403).json({ message: 'Access denied.' });

    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length < 2)
      return res.status(400).json({ message: 'Select at least 2 students to compare' });

    if (studentIds.length > 4)
      return res.status(400).json({ message: 'You can compare maximum 4 students at once' });

    const results = await Promise.all(studentIds.map(async (id) => {
      const student = await User.findById(id).select('name email');
      if (!student) return null;

      const interviews = await Interview.find({
        student: id,
        status: 'completed'
      }).sort({ createdAt: -1 });

      const scores = interviews.map(i => i.feedback?.score || 0);
      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

      const allStrengths = interviews.flatMap(i => i.feedback?.strengths || []);
      const allImprovements = interviews.flatMap(i => i.feedback?.improvements || []);

      const isShortlisted = await Shortlist.findOne({
        recruiter: req.user._id,
        student: id
      });

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        totalInterviews: interviews.length,
        avgScore,
        bestScore,
        topStrengths: [...new Set(allStrengths)].slice(0, 5),
        topImprovements: [...new Set(allImprovements)].slice(0, 5),
        recentInterviews: interviews.slice(0, 3).map(i => ({
          role: i.role,
          company: i.company,
          domain: i.domain,
          score: i.feedback?.score,
          createdAt: i.createdAt
        })),
        isShortlisted: !!isShortlisted
      };
    }));

    res.json(results.filter(r => r !== null));

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};