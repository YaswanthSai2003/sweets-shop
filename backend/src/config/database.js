const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // User indexes
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    // Sweet indexes
    await mongoose.connection.db.collection('sweets').createIndex({ name: 1 });
    await mongoose.connection.db.collection('sweets').createIndex({ category: 1 });
    await mongoose.connection.db.collection('sweets').createIndex({ price: 1 });
    
    // Transaction indexes
    await mongoose.connection.db.collection('transactions').createIndex({ userId: 1 });
    await mongoose.connection.db.collection('transactions').createIndex({ createdAt: -1 });
    
    console.log('✅ Database indexes created');
  } catch (error) {
    console.log('⚠️ Indexes may already exist:', error.message);
  }
};

module.exports = connectDB;
