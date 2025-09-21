const express = require('express');
const { 
  getAllSweets, 
  searchSweets, 
  getSweet, 
  createSweet, 
  updateSweet, 
  deleteSweet, 
  purchaseSweets, 
  restockSweet, 
  getCategories 
} = require('../controllers/sweetsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllSweets);
router.get('/search', searchSweets);
router.get('/categories', getCategories);
router.get('/:id', getSweet);

// Protected routes (require authentication)
router.post('/purchase', authenticateToken, purchaseSweets);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, createSweet);
router.put('/:id', authenticateToken, requireAdmin, updateSweet);
router.delete('/:id', authenticateToken, requireAdmin, deleteSweet);
router.post('/:id/restock', authenticateToken, requireAdmin, restockSweet);

module.exports = router;
