const Admin = require('../models/admin');
const bcrypt = require('bcrypt');

const seedAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      const admin = new Admin({
        name: 'Super Admin',
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Admin account seeded successfully');
    } else {
      console.log('Admin account already exists');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

module.exports = seedAdmin;
