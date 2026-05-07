require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI not set in .env');

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const Shop = require('../models/Shop');
  const Service = require('../models/Service');
  const WorkingHours = require('../models/WorkingHours');
  const AdminUser = require('../models/AdminUser');

  await Shop.deleteMany({});
  await Shop.create({
    name: { he: 'רון פז', en: 'Ron Paz' },
    description: {
      he: 'ברוכים הבאים למרחב שבו יצירתיות פוגשת דיוק. רון פז, מעצב שיער בעל ניסיון עשיר, מזמין אתכם לחוויית טיפוח אישית המשלבת את הטרנדים המובילים עם התאמה מושלמת למבנה הפנים ולאורח החיים שלכם. כאן, כל תספורת היא אמנות וכל לקוח הוא במרכז.',
      en: 'Professional men\'s barbershop — haircuts, beard styling, and special treatments in a welcoming environment.',
    },
    address: 'ויצמן 92, כפר סבא',
    phone: '054-7520575',
    email: '',
    galleryUrls: [],
    socialLinks: {
      instagram: 'https://www.instagram.com/rp_hairstyles_?igsh=cWF4djZsYnU4cnRp&utm_source=qr',
      whatsapp: 'https://wa.me/972547520575',
    },
  });
  console.log('Shop seeded');

  await Service.deleteMany({});
  await Service.insertMany([
    { name: { he: 'תספורת גברים', en: "Men's Haircut" }, description: { he: '', en: '' }, durationMinutes: 30, priceIls: 70, category: 'haircut', sortOrder: 1 },
    { name: { he: 'פייד', en: 'Skin Fade' }, description: { he: '', en: '' }, durationMinutes: 40, priceIls: 90, category: 'haircut', sortOrder: 2 },
    { name: { he: 'גילוח מכונה', en: 'Buzz Cut' }, description: { he: '', en: '' }, durationMinutes: 15, priceIls: 50, category: 'haircut', sortOrder: 3 },
    { name: { he: 'תספורת ילדים', en: "Kids' Haircut" }, description: { he: '', en: '' }, durationMinutes: 25, priceIls: 60, category: 'haircut', sortOrder: 4 },
    { name: { he: 'עיצוב זקן', en: 'Beard Trim' }, description: { he: '', en: '' }, durationMinutes: 15, priceIls: 40, category: 'beard', sortOrder: 5 },
    { name: { he: 'עיצוב וקווים', en: 'Beard Shape & Line-Up' }, description: { he: '', en: '' }, durationMinutes: 20, priceIls: 50, category: 'beard', sortOrder: 6 },
    { name: { he: 'גילוח מגבת חמה', en: 'Hot Towel Shave' }, description: { he: '', en: '' }, durationMinutes: 30, priceIls: 70, category: 'beard', sortOrder: 7 },
    { name: { he: 'תספורת + זקן', en: 'Haircut + Beard Trim' }, description: { he: '', en: '' }, durationMinutes: 45, priceIls: 110, category: 'combo', sortOrder: 8 },
    { name: { he: 'הטיפול המלא', en: 'The Full Treatment' }, description: { he: '', en: '' }, durationMinutes: 60, priceIls: 150, category: 'combo', sortOrder: 9 },
    { name: { he: 'עיצוב גבות', en: 'Eyebrow Grooming' }, description: { he: '', en: '' }, durationMinutes: 10, priceIls: 25, category: 'other', sortOrder: 10 },
    { name: { he: 'צביעת שיער', en: 'Hair Coloring' }, description: { he: '', en: '' }, durationMinutes: 60, priceIls: 150, category: 'other', sortOrder: 11 },
  ]);
  console.log('Services seeded');

  await WorkingHours.deleteMany({});
  await WorkingHours.insertMany([
    { dayOfWeek: 0, startTime: '10:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 1, startTime: '10:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 2, startTime: '10:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 3, startTime: '10:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 4, startTime: '10:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 5, startTime: '09:00', endTime: '14:00', isActive: true },
    { dayOfWeek: 6, startTime: '09:00', endTime: '20:00', isActive: false },
  ]);
  console.log('Working hours seeded');

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!';
  const existing = await AdminUser.findOne({ username: adminUsername });
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await AdminUser.create({ username: adminUsername, passwordHash, role: 'admin' });
    console.log(`Admin user '${adminUsername}' created`);
  } else {
    console.log(`Admin user '${adminUsername}' already exists`);
  }

  await mongoose.disconnect();
  console.log('Seed complete!');
}

main().catch((err) => { console.error(err); process.exit(1); });
