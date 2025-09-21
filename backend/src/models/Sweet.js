const mongoose = require('mongoose');

const sweetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  image: {
    type: String,
    default: '🍬'
  },
  imageUrl: {
    type: String, // For uploaded images
    default: ''
  }
}, {
  timestamps: true
});

sweetSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Sweet', sweetSchema);
