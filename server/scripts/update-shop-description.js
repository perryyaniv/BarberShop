require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Shop = require('../models/Shop');
const WorkingHours = require('../models/WorkingHours');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const shopResult = await Shop.updateOne({}, {
    $set: {
      'name.he': 'רון פז',
      'name.en': 'Ron Paz',
      'description.he': 'ברוכים הבאים למרחב שבו יצירתיות פוגשת דיוק. רון פז, מעצב שיער בעל ניסיון עשיר, מזמין אתכם לחוויית טיפוח אישית המשלבת את הטרנדים הבינלאומיים המובילים עם התאמה מושלמת למבנה הפנים ולאורח החיים שלכם. כאן, כל תספורת היא אמנות וכל לקוח הוא במרכז.',
      address: 'ויצמן 92, כפר סבא',
      phone: '054-7520575',
      'socialLinks.instagram': 'https://www.instagram.com/rp_hairstyles_?igsh=cWF4djZsYnU4cnRp&utm_source=qr',
      'socialLinks.whatsapp': 'https://wa.me/972547520575',
      'socialLinks.facebook': '',
    }
  });
  console.log('Shop updated:', shopResult.modifiedCount, 'document(s)');

  const hours = [
    { dayOfWeek: 0, startTime: '10:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 1, startTime: '10:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 2, startTime: '10:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 3, startTime: '10:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 4, startTime: '10:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 5, startTime: '09:00', endTime: '14:00', isActive: true },
    { dayOfWeek: 6, startTime: '09:00', endTime: '20:00', isActive: false },
  ];
  for (const h of hours) {
    await WorkingHours.updateOne({ dayOfWeek: h.dayOfWeek }, { $set: h });
  }
  console.log('Working hours updated');

  await mongoose.disconnect();
}

main().catch(console.error);
