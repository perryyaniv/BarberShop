const express = require('express');
const { addHours, format } = require('date-fns');
const { he: heLocale } = require('date-fns/locale');
const { connectDB } = require('../lib/db');
const Appointment = require('../models/Appointment');
const { sendSms, formatReminderMessage } = require('../lib/sms');

const router = express.Router();

router.get('/auto-complete', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  await connectDB();
  const cutoff = new Date(Date.now() - 60 * 60 * 1000);
  const result = await Appointment.updateMany(
    { startTime: { $lt: cutoff }, status: 'confirmed' },
    { $set: { status: 'completed' } }
  );
  res.json({ completed: result.modifiedCount });
});

router.get('/reminders', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

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

  let sent = 0;
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
    sent++;
  }

  res.json({ sent });
});

module.exports = router;
