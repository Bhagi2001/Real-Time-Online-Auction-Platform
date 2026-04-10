import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import Setting from '../models/Setting.js';

const router = express.Router();

// Default values for policies
const DEFAULT_POLICIES = {
  terms: '<h1>Terms & Conditions</h1><p>Welcome to BidLanka. By using our platform, you agree to these terms...</p>',
  privacy: '<h1>Privacy Policy</h1><p>We value your privacy. This policy explains how we handle your data...</p>',
  cookies: '<h1>Cookie Policy</h1><p>We use cookies to improve your experience on our platform...</p>',
};

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const settings = await Setting.find();
    
    // Ensure all default policies exist
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    const results = {};
    for (const [key, defaultValue] of Object.entries(DEFAULT_POLICIES)) {
      if (!settingsMap[key]) {
        // Create it if it doesn't exist
        const newSetting = await Setting.create({ key, value: defaultValue });
        results[key] = newSetting.value;
      } else {
        results[key] = settingsMap[key];
      }
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Update a setting
// @route   PUT /api/settings/:key
// @access  Private/Admin
router.put('/:key', protect, adminOnly, async (req, res) => {
  try {
    const { value } = req.body;
    const { key } = req.params;

    let setting = await Setting.findOne({ key });

    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await Setting.create({ key, value });
    }

    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
