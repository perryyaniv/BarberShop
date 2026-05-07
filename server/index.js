process.env.TZ = 'Asia/Jerusalem'; // All date operations use Israel time
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { connectDB } = require('./lib/db');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const appointmentRoutes = require('./routes/appointments');
const otpRoutes = require('./routes/otp');
const publicRoutes = require('./routes/public');
const cronRoutes = require('./routes/cron');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api', publicRoutes);
app.use('/api/cron', cronRoutes);

// SMS reminders at 07:00 and 17:00 Israel time
cron.schedule('0 7,17 * * *', async () => {
  try {
    const { addHours, format } = require('date-fns');
    const { he: heLocale } = require('date-fns/locale');
    const Appointment = require('./models/Appointment');
    const { sendSms, formatReminderMessage } = require('./lib/sms');

    await connectDB();
    const now = new Date();
    const in24h = addHours(now, 24);
    const windowStart = new Date(now.getTime() + 5 * 60 * 1000);

    const upcoming = await Appointment.find({
      startTime: { $gte: windowStart, $lte: in24h },
      status: 'confirmed',
    })
      .populate('customerId')
      .populate('serviceId', 'name')
      .lean();

    for (const appt of upcoming) {
      const customer = appt.customerId;
      const service = appt.serviceId;
      if (!customer?.phone) continue;
      const locale = customer.localePref || 'he';
      const dateLocale = locale === 'he' ? heLocale : undefined;
      const dateStr = format(appt.startTime, 'd/M/yyyy', { locale: dateLocale });
      const timeStr = format(appt.startTime, 'HH:mm');
      const serviceName = service?.name?.[locale] || 'תור';
      const msg = formatReminderMessage(customer.name, serviceName, dateStr, timeStr, locale);
      await sendSms(customer.phone, msg);
    }
  } catch (err) {
    console.error('Cron reminder error:', err);
  }
});

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });
