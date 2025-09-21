const express = require('express');
const Transaction = require('../models/Transaction');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get user's transactions
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, page = 1, type } = req.query;
    
    const query = { userId: req.user._id };
    if (type) query.transactionType = type;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: { transactions }
    });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions'
    });
  }
});

// Get all transactions (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, page = 1, type, userId } = req.query;
    
    const query = {};
    if (type) query.transactionType = type;
    if (userId) query.userId = userId;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'All transactions retrieved successfully',
      data: { transactions }
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions'
    });
  }
});

// Get sales report (Admin only) - FIXED
router.get('/sales-report', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = { transactionType: 'purchase' };
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const salesData = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalTransactions: { $sum: 1 },
          averageTransaction: { $avg: '$totalAmount' }
        }
      }
    ]);

    const summary = salesData.length > 0 ? salesData[0] : {
      totalSales: 0,
      totalTransactions: 0,
      averageTransaction: 0
    };

    // Remove the _id field
    delete summary._id;

    res.status(200).json({
      success: true,
      message: 'Sales report generated successfully',
      data: { summary }
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report',
      error: error.message
    });
  }
});

// Get transaction by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('userId', 'name email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user owns this transaction or is admin
    if (transaction.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
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
});

module.exports = router;
