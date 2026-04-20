import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    maxlength: 50
  },
  icon: {
    type: String, // e.g. "Monitor", "Shirt", or just leave empty
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
