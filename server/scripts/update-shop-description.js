require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Shop = require('../models/Shop');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await Shop.updateOne({}, {
    $set: {
      'description.he': 'ברוכים הבאים למרחב שבו יצירתיות פוגשת דיוק. רון פז, מעצב שיער בעל ניסיון עשיר, מזמין אתכם לחוויית טיפוח אישית המשלבת את הטרנדים הבינלאומיים המובילים עם התאמה מושלמת למבנה הפנים ולאורח החיים שלכם. כאן, כל תספורת היא אמנות וכל לקוח הוא במרכז.',
    }
  });
  console.log('Updated:', result.modifiedCount, 'document(s)');
  await mongoose.disconnect();
}

main().catch(console.error);
