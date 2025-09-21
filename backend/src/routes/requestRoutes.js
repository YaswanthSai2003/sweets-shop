const express = require('express');
const Request = require('../models/Request');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// User: Send a request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, title, message, items = [] } = req.body;
    
    const request = new Request({
      userId: req.user._id,
      type,
      title,
      message,
      items,
      status: 'pending'
    });

    await request.save();
    await request.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Request sent successfully',
      data: { request }
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to send request'
    });
  }
});

// User: Get user's requests
router.get('/my-requests', authenticateToken, async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('respondedBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Requests retrieved successfully',
      data: { requests }
    });
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve requests'
    });
  }
});

// Admin: Get all requests
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;

    const requests = await Request.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('respondedBy', 'name');

    res.status(200).json({
      success: true,
      message: 'All requests retrieved successfully',
      data: { requests }
    });
  } catch (error) {
    console.error('Get admin requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve requests'
    });
  }
});

// Admin: Respond to a request
router.put('/:id/respond', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminResponse,
        respondedAt: new Date(),
        respondedBy: req.user._id
      },
      { new: true }
    ).populate('userId', 'name email').populate('respondedBy', 'name');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Response sent successfully',
      data: { request }
    });
  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send response'
    });
  }
});

module.exports = router;
