import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

await mongoose.connect(process.env.MONGODB_URI);

const exists = await User.findOne({ email: process.env.ADMIN_EMAIL });
if (exists) {
  console.log('Admin already exists');
} else {
  await User.create({
    name: 'Admin',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: 'admin',
  });
  console.log('Admin created');
}
await mongoose.disconnect();