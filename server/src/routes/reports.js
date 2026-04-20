import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import Report from '../models/Report.js';

const router = express.Router();

// @route   POST /api/reports
// @desc    Submit a new issue report
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { category, auctionUrl, description } = req.body;

    const report = new Report({
      user: req.user._id,
      category,
      auctionUrl,
      description,
    });

    const savedReport = await report.save();
    res.status(201).json(savedReport);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/reports/admin
// @desc    Get all reports (Admin only)
// @access  Private/Admin
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/reports/admin/:id
// @desc    Update report status (Admin only)
// @access  Private/Admin
router.put('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    await report.save();

    const updatedReport = await Report.findById(req.params.id).populate('user', 'name email');
    res.json(updatedReport);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
