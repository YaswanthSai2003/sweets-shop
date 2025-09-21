const mongoose = require('mongoose');

const transactionItemSchema = new mongoose.Schema({
  sweetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sweet',
    required: true
  },
  sweetName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0.01
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0.01
  }
});

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [transactionItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0.01
  },
  transactionType: {
    type: String,
    enum: ['purchase', 'restock'],
    default: 'purchase'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Calculate total before saving
transactionSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => total + item.subtotal, 0);
  }
  next();
});

// Static method to get user transactions
transactionSchema.statics.getUserTransactions = function(userId, limit = 50) {
  return this.find({ userId })
    .populate('items.sweetId', 'name image')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get sales report
transactionSchema.statics.getSalesReport = function(startDate, endDate) {
  const matchQuery = { transactionType: 'purchase' };
  
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchQuery },
    { 
      $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        totalTransactions: { $sum: 1 },
        averageTransaction: { $avg: '$totalAmount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);
