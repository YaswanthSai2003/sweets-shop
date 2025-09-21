const Sweet = require('../models/Sweet');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Get all sweets
const getAllSweets = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const query = {};
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sweets = await Sweet.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Sweet.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Sweets retrieved successfully',
      data: {
        sweets,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: sweets.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get sweets error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve sweets at this time'
    });
  }
};

// Search sweets
const searchSweets = async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;
    
    const query = {};
    
    if (name) query.name = { $regex: name, $options: 'i' };
    if (category && category !== 'all') query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    const sweets = await Sweet.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: { sweets }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search could not be completed'
    });
  }
};

// Get single sweet
const getSweet = async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    
    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Sweet details retrieved successfully',
      data: { sweet }
    });
  } catch (error) {
    console.error('Get sweet error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve sweet details'
    });
  }
};

// Create sweet (Admin only)
const createSweet = async (req, res) => {
  try {
    const sweetData = {
      name: req.body.name,
      category: req.body.category,
      price: parseFloat(req.body.price),
      quantity: parseInt(req.body.quantity),
      description: req.body.description || '',
      image: req.body.image || '🍬'
    };

    // Handle image upload if file is provided
    if (req.file) {
      sweetData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const sweet = new Sweet(sweetData);
    const savedSweet = await sweet.save();

    res.status(201).json({
      success: true,
      message: 'New sweet added successfully to inventory',
      data: { sweet: savedSweet }
    });
  } catch (error) {
    console.error('Create sweet error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to add sweet to inventory',
      error: error.message
    });
  }
};

// Update sweet (Admin only)
const updateSweet = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      category: req.body.category,
      price: parseFloat(req.body.price),
      quantity: parseInt(req.body.quantity),
      description: req.body.description || '',
      image: req.body.image || '🍬'
    };

    // Handle image upload if file is provided
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const sweet = await Sweet.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found in inventory'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sweet details updated successfully',
      data: { sweet }
    });
  } catch (error) {
    console.error('Update sweet error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update sweet details',
      error: error.message
    });
  }
};

// Delete sweet (Admin only)
const deleteSweet = async (req, res) => {
  try {
    const sweet = await Sweet.findByIdAndDelete(req.params.id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found in inventory'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sweet removed from inventory successfully'
    });
  } catch (error) {
    console.error('Delete sweet error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to remove sweet from inventory'
    });
  }
};

// Restock sweet (Admin only)
const restockSweet = async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid quantity to restock'
      });
    }

    const sweet = await Sweet.findById(req.params.id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found in inventory'
      });
    }

    const previousQuantity = sweet.quantity;
    sweet.quantity += parseInt(quantity);
    await sweet.save();

    // Record restock transaction
    try {
      await Transaction.create({
        userId: req.user._id,
        items: [{
          sweetId: sweet._id,
          sweetName: sweet.name,
          quantity: parseInt(quantity),
          price: sweet.price,
          subtotal: 0
        }],
        totalAmount: 0,
        transactionType: 'restock',
        status: 'completed'
      });
    } catch (transactionError) {
      console.error('Restock transaction error:', transactionError);
      // Continue even if transaction logging fails
    }

    res.status(200).json({
      success: true,
      message: `Successfully restocked ${quantity} units of ${sweet.name}. Previous stock: ${previousQuantity}, New stock: ${sweet.quantity}`,
      data: { sweet }
    });
  } catch (error) {
    console.error('Restock error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to restock item at this time'
    });
  }
};

// Purchase sweets
const purchaseSweets = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    console.log('Purchase request received:', req.body);
    console.log('User making purchase:', req.user);

    await session.withTransaction(async () => {
      const { items, customerInfo = {} } = req.body;
      
      // Validate request data
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('No items provided for purchase');
      }
      
      let transactionItems = [];
      let totalAmount = 0;

      // Validate and process each item
      for (let item of items) {
        console.log('Processing item:', item);
        
        if (!item.sweetId || !item.quantity || item.quantity <= 0) {
          throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
        }

        const sweet = await Sweet.findById(item.sweetId).session(session);
        
        if (!sweet) {
          throw new Error(`Product not found: ${item.sweetId}`);
        }
        
        if (sweet.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${sweet.name}. Available: ${sweet.quantity}, Requested: ${item.quantity}`);
        }
        
        const subtotal = sweet.price * item.quantity;
        totalAmount += subtotal;
        
        transactionItems.push({
          sweetId: sweet._id,
          sweetName: sweet.name,
          quantity: item.quantity,
          price: sweet.price,
          subtotal: subtotal
        });
        
        // Update stock
        sweet.quantity -= item.quantity;
        await sweet.save({ session });
        console.log(`Updated ${sweet.name} stock to ${sweet.quantity}`);
      }

      // Create transaction record
      const transaction = new Transaction({
        userId: req.user._id,
        items: transactionItems,
        totalAmount: totalAmount,
        transactionType: 'purchase',
        customerInfo: customerInfo,
        status: 'completed'
      });

      const savedTransaction = await transaction.save({ session });
      console.log('Transaction saved:', savedTransaction._id);

      res.status(201).json({
        success: true,
        message: 'Purchase completed successfully',
        data: { 
          transaction: savedTransaction,
          receipt: {
            orderId: savedTransaction._id,
            items: transactionItems,
            total: totalAmount,
            customerInfo: customerInfo,
            purchasedAt: new Date()
          }
        }
      });
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Purchase could not be completed',
      details: error.stack // Add for debugging
    });
  } finally {
    await session.endSession();
  }
};


// Get categories
const getCategories = async (req, res) => {
  try {
    const categories = await Sweet.distinct('category');
    
    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve categories'
    });
  }
};

module.exports = {
  getAllSweets,
  searchSweets,
  getSweet,
  createSweet,
  updateSweet,
  deleteSweet,
  purchaseSweets,
  restockSweet,
  getCategories
};
