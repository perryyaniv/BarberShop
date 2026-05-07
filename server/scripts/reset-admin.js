require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');

const username = process.argv[2] || 'admin';
const password = process.argv[3] || 'Admin1234!';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  await AdminUser.deleteMany({});
  const passwordHash = await bcrypt.hash(password, 12);
  await AdminUser.create({ username, passwordHash, role: 'admin' });
  console.log(`Admin reset — username: "${username}", password: "${password}"`);
  await mongoose.disconnect();
}

main().catch(console.error);
