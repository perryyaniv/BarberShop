const express = require('express');
const mongoose = require('mongoose');
const { addMinutes, parseISO, setHours, setMinutes, startOfDay, endOfDay, startOfWeek, endOfWeek } = require('date-fns');
const { requireAuth } = require('../middleware/auth');
const { connectDB } = require('../lib/db');
const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const BlockedSlot = require('../models/BlockedSlot');
const WorkingHours = require('../models/WorkingHours');
const Shop = require('../models/Shop');
const { serviceSchema, blockedSlotSchema, walkInSchema } = require('../lib/validations');

const router = express.Router();
router.use(requireAuth);

// Dashboard
router.get('/dashboard', async (req, res) => {
  await connectDB();
  const now = new Date();
  const [todayCount, weekCount, totalCustomers, nextAppointment] = await Promise.all([
    Appointment.countDocuments({
      startTime: { $gte: startOfDay(now), $lte: endOfDay(now) },
      status: { $nin: ['cancelled', 'no_show'] },
    }),
    Appointment.countDocuments({
      startTime: { $gte: startOfWeek(now), $lte: endOfWeek(now) },
      status: { $nin: ['cancelled', 'no_show'] },
    }),
    Customer.countDocuments(),
    Appointment.findOne({
      startTime: { $gte: now },
      status: { $in: ['confirmed', 'pending_verification'] },
    })
      .sort({ startTime: 1 })
      .populate('serviceId', 'name')
      .populate('customerId', 'name phone')
      .lean(),
  ]);
  res.json({ todayCount, weekCount, totalCustomers, nextAppointment });
});

// Appointments
router.get('/appointments', async (req, res) => {
  try {
    await connectDB();
    const { from, to, status } = req.query;
    const query = {};
    if (from || to) {
      query.startTime = {};
      if (from) query.startTime.$gte = new Date(from);
      if (to) query.startTime.$lte = new Date(to);
    }
    if (status && status !== 'all') query.status = status;
    const appointments = await Appointment.find(query)
      .sort({ startTime: 1 })
      .populate('serviceId', 'name durationMinutes priceIls')
      .populate('customerId', 'name phone')
      .lean();
    res.json({ appointments });
  } catch (err) {
    console.error('Admin appointments error:', err);
    res.status(500).json({ error: 'Server error', appointments: [] });
  }
});

router.post('/appointments', async (req, res) => {
  const parsed = walkInSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { serviceId, date, startTime, customerName, customerPhone, notes } = parsed.data;
  await connectDB();

  const service = await Service.findById(serviceId);
  if (!service) return res.status(404).json({ error: 'Service not found' });

  const [h, m] = startTime.split(':').map(Number);
  const dateObj = parseISO(date);
  const start = setMinutes(setHours(dateObj, h), m);
  const end = addMinutes(start, service.durationMinutes);

  const dbSession = await mongoose.startSession();
  try {
    let apptId = null;
    await dbSession.withTransaction(async () => {
      let customer = await Customer.findOne({ phone: customerPhone }).session(dbSession);
      if (!customer) {
        const created = await Customer.create(
          [{ name: customerName, phone: customerPhone, phoneVerified: true }],
          { session: dbSession }
        );
        customer = created[0];
      }
      const appt = await Appointment.create(
        [{ customerId: customer._id, serviceId, startTime: start, endTime: end, status: 'confirmed', notes }],
        { session: dbSession }
      );
      apptId = appt[0]._id.toString();
    });
    res.status(201).json({ appointmentId: apptId });
  } finally {
    await dbSession.endSession();
  }
});

router.put('/appointments/:id', async (req, res) => {
  try {
    await connectDB();
    const { status, cancelReason } = req.body;
    const validStatuses = ['confirmed', 'completed', 'cancelled', 'no_show'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const update = {};
    if (status) update.status = status;
    if (status === 'cancelled') {
      update.cancelledAt = new Date();
      update.cancelReason = cancelReason || 'Admin cancelled';
    }
    const appt = await Appointment.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!appt) return res.status(404).json({ error: 'Not found' });
    res.json({ appointment: appt });
  } catch (err) {
    console.error('Admin update appointment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Services
router.get('/services', async (req, res) => {
  await connectDB();
  const services = await Service.find().sort({ sortOrder: 1 }).lean();
  res.json({ services });
});

router.post('/services', async (req, res) => {
  const parsed = serviceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await connectDB();
  const service = await Service.create(parsed.data);
  res.status(201).json({ service });
});

router.put('/services/:id', async (req, res) => {
  const parsed = serviceSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await connectDB();
  const service = await Service.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!service) return res.status(404).json({ error: 'Not found' });
  res.json({ service });
});

router.delete('/services/:id', async (req, res) => {
  await connectDB();
  await Service.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Working Hours
router.get('/working-hours', async (req, res) => {
  await connectDB();
  const hours = await WorkingHours.find().sort({ dayOfWeek: 1 }).lean();
  res.json({ hours });
});

router.put('/working-hours', async (req, res) => {
  const { dayOfWeek, startTime, endTime, isActive } = req.body;
  if (dayOfWeek === undefined) return res.status(400).json({ error: 'dayOfWeek required' });
  await connectDB();
  const updated = await WorkingHours.findOneAndUpdate(
    { dayOfWeek },
    { dayOfWeek, startTime, endTime, isActive },
    { upsert: true, new: true }
  );
  res.json({ hours: updated });
});

// Blocked Slots
router.get('/blocked-slots', async (req, res) => {
  await connectDB();
  const slots = await BlockedSlot.find().sort({ startDatetime: 1 }).lean();
  res.json({ slots });
});

router.post('/blocked-slots', async (req, res) => {
  const parsed = blockedSlotSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await connectDB();
  const slot = await BlockedSlot.create({
    startDatetime: new Date(parsed.data.startDatetime),
    endDatetime: new Date(parsed.data.endDatetime),
    reason: parsed.data.reason,
  });
  res.status(201).json({ slot });
});

router.delete('/blocked-slots/:id', async (req, res) => {
  await connectDB();
  await BlockedSlot.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Customers
router.get('/customers', async (req, res) => {
  await connectDB();
  const search = req.query.search || '';
  const query = search
    ? { $or: [{ name: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }] }
    : {};
  const customers = await Customer.find(query).sort({ createdAt: -1 }).lean();
  const customerIds = customers.map((c) => c._id);
  const appointmentCounts = await Appointment.aggregate([
    { $match: { customerId: { $in: customerIds }, status: { $in: ['confirmed', 'completed'] } } },
    { $group: { _id: '$customerId', count: { $sum: 1 }, lastVisit: { $max: '$startTime' } } },
  ]);
  const countMap = new Map(appointmentCounts.map((a) => [a._id.toString(), { count: a.count, lastVisit: a.lastVisit }]));
  const result = customers.map((c) => ({
    ...c,
    _id: c._id.toString(),
    visitCount: countMap.get(c._id.toString())?.count ?? 0,
    lastVisit: countMap.get(c._id.toString())?.lastVisit ?? null,
  }));
  res.json({ customers: result });
});

// Appointments in a time range (used for blocked-slot conflict check)
router.get('/appointments-in-range', async (req, res) => {
  await connectDB();
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to required' });
  const appointments = await Appointment.find({
    startTime: { $lt: new Date(to) },
    endTime: { $gt: new Date(from) },
    status: { $in: ['confirmed', 'pending_verification'] },
  })
    .populate('serviceId', 'name')
    .populate('customerId', 'name phone')
    .lean();
  res.json({ appointments });
});

// Shop settings
router.get('/shop-settings', async (req, res) => {
  await connectDB();
  const shop = await Shop.findOne().lean();
  res.json({
    slotIntervalMinutes: shop?.slotIntervalMinutes ?? 30,
    minDaysBetweenAppointments: shop?.minDaysBetweenAppointments ?? 0,
  });
});

router.put('/shop-settings', async (req, res) => {
  const { slotIntervalMinutes, minDaysBetweenAppointments } = req.body;
  const update = {};

  if (slotIntervalMinutes !== undefined) {
    const valid = [10, 15, 20, 30, 45, 60];
    if (!valid.includes(slotIntervalMinutes)) {
      return res.status(400).json({ error: 'ערך לא תקין עבור הפרש זמנים' });
    }
    update.slotIntervalMinutes = slotIntervalMinutes;
  }

  if (minDaysBetweenAppointments !== undefined) {
    const v = Number(minDaysBetweenAppointments);
    if (!Number.isInteger(v) || v < 0 || v > 365) {
      return res.status(400).json({ error: 'ערך לא תקין עבור מינימום ימים בין תורים' });
    }
    update.minDaysBetweenAppointments = v;
  }

  if (Object.keys(update).length === 0) return res.status(400).json({ error: 'לא נמסרו הגדרות לעדכון' });

  await connectDB();
  const shop = await Shop.findOneAndUpdate({}, update, { new: true, upsert: true }).lean();
  res.json({
    slotIntervalMinutes: shop.slotIntervalMinutes,
    minDaysBetweenAppointments: shop.minDaysBetweenAppointments,
  });
});

module.exports = router;
