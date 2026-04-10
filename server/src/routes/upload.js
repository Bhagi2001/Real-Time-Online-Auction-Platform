import express from 'express';
import path from 'path';
import { upload } from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/upload/images — upload up to 5 images
router.post('/images', protect, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ message: 'No files uploaded' });

  const urls = req.files.map(file => `/uploads/${file.filename}`);
  res.json({ urls, message: `${req.files.length} image(s) uploaded successfully` });
});

// POST /api/upload/avatar
router.post('/avatar', protect, upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

export default router;
