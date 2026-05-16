// -----------------------------------------
// Seed Admin Script
// Creates a default admin account
// Run: npm run seed
// -----------------------------------------
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@artisan.com' });

    if (existingAdmin) {
      console.log('Admin account already exists.');
      console.log('Email: admin@artisan.com');
      process.exit(0);
    }

    // Create admin account
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@artisan.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('Admin account created successfully.');
    console.log('Email: admin@artisan.com');
    console.log('Password: admin123');
    console.log('IMPORTANT: Change these credentials in production.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
