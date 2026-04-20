import express from 'express';
import Category from '../models/Category.js';
import Auction from '../models/Auction.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/categories — Public route for dropdown menus
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/categories — Admin route to add new categories
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) return res.status(400).json({ message: 'Category already exists' });

    const category = await Category.create({ name, icon });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/categories/:id — Admin route to delete a category
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Check if any auctions are using this category before deleting
    // For safety, re-assign them to "Other"
    await Auction.updateMany({ category: category.name }, { category: 'Other' });
    
    await category.deleteOne();
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
