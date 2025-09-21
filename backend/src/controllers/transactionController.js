const Transaction = require('../models/Transaction');

// Get user transactions
const getUserTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    
    const transactions = await Transaction.find({ userId })
      .populate('items.sweetId', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Transaction.countDocuments({ userId });
    
    res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: {
        transactions,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: transactions.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions'
    });
  }
};

// Get single transaction
const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('items.sweetId', 'name image category');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Transaction retrieved successfully',
      data: { transaction }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction'
    });
  }
};

// Get all transactions (Admin only)
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, startDate, endDate } = req.query;
    
    const query = {};
    
    if (type) query.transactionType = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(query)
      .populate('userId', 'name email')
      .populate('items.sweetId', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Transaction.countDocuments(query);
    
    res.status(200).json({
      success: true,
      message: 'All transactions retrieved successfully',
      data: {
        transactions,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: transactions.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions'
    });
  }
};

// Get sales report (Admin only)
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = { transactionType: 'purchase' };
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }
    
    // Summary stats
    const summary = await Transaction.aggregate([
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
    
    // Top selling sweets
    const topSweets = await Transaction.aggregate([
      { $match: matchQuery },
      { $unwind: '$items' },
      { 
        $group: {
          _id: '$items.sweetId',
          sweetName: { $first: '$items.sweetName' },
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Sales report generated successfully',
      data: {
        summary: summary[0] || { totalSales: 0, totalTransactions: 0, averageTransaction: 0 },
        topSweets
      }
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report'
    });
  }
};

module.exports = {
  getUserTransactions,
  getTransaction,
  getAllTransactions,
  getSalesReport
};
