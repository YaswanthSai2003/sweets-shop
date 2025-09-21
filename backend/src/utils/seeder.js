const mongoose = require('mongoose');
const User = require('../models/User');
const Sweet = require('../models/Sweet');
require('dotenv').config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    await User.deleteMany({});
    await Sweet.deleteMany({});
    console.log('🗑️ Cleared existing data');
    
    // Seed users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@sweetshop.com',
        password: 'password123',
        role: 'admin'
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user'
      }
    ];
    
    const createdUsers = await User.create(users);
    console.log(`👥 Created ${createdUsers.length} users`);
    
    // Seed sweets
    const sweets = [
      {
        name: 'Chocolate Cake',
        category: 'Cakes',
        price: 25.99,
        quantity: 10,
        description: 'Rich, moist chocolate cake with layers of chocolate ganache',
        image: '🍰'
      },
      {
        name: 'Strawberry Cupcake',
        category: 'Cupcakes',
        price: 4.99,
        quantity: 24,
        description: 'Light and fluffy cupcakes topped with strawberry buttercream',
        image: '🧁'
      },
      {
        name: 'Vanilla Ice Cream',
        category: 'Ice Cream',
        price: 8.99,
        quantity: 15,
        description: 'Creamy vanilla ice cream made with real vanilla beans',
        image: '🍦'
      },
      {
        name: 'Gummy Bears',
        category: 'Candies',
        price: 3.49,
        quantity: 50,
        description: 'Colorful fruit-flavored gummy bears in assorted flavors',
        image: '🐻'
      },
      {
        name: 'Chocolate Cookies',
        category: 'Cookies',
        price: 12.99,
        quantity: 30,
        description: 'Homemade chocolate chip cookies with premium chocolate chips',
        image: '🍪'
      },
      {
        name: 'Rainbow Donuts',
        category: 'Donuts',
        price: 6.99,
        quantity: 18,
        description: 'Glazed donuts with colorful rainbow sprinkles',
        image: '🍩'
      },
      {
        name: 'Cotton Candy',
        category: 'Candies',
        price: 5.49,
        quantity: 25,
        description: 'Light and fluffy cotton candy in pink and blue',
        image: '🍭'
      },
      {
        name: 'Apple Pie',
        category: 'Pies',
        price: 18.99,
        quantity: 8,
        description: 'Traditional apple pie with cinnamon and flaky crust',
        image: '🥧'
      },
      {
        name: 'Chocolate Truffles',
        category: 'Chocolates',
        price: 15.99,
        quantity: 20,
        description: 'Handcrafted chocolate truffles with various fillings',
        image: '🍫'
      },
      {
        name: 'Lemon Tart',
        category: 'Tarts',
        price: 14.99,
        quantity: 12,
        description: 'Tangy lemon curd tart with buttery pastry crust',
        image: '🍋'
      }
    ];
    
    const createdSweets = await Sweet.create(sweets);
    console.log(`🍬 Created ${createdSweets.length} sweets`);
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@sweetshop.com / password123');
    console.log('User: john@example.com / password123');
    console.log('User: jane@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
