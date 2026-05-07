const express = require('express');
const { addMinutes, parseISO, setHours, setMinutes } = require('date-fns');
const { connectDB } = require('../lib/db');
const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const { createAppointmentSchema, normalizePhone } = require('../lib/validations');
const { checkSlotAvailable, getAvailableSlots } = require('../lib/availability');

const router = express.Router();

router.get('/available-slots', async (req, res) => {
  const { date, serviceId } = req.query;
  if (!date || !serviceId) {
    return res.status(400).json({ error: 'date and serviceId are required' });
  }
  await connectDB();
  const service = await Service.findById(serviceId);
  if (!service || !service.isActive) {
    return res.status(404).json({ error: 'Service not found' });
  }
  const slots = await getAvailableSlots(date, service.durationMinutes);
  res.json({ slots });
});

// Get appointments by customer phone
router.get('/my', async (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  await connectDB();
  const normalized = normalizePhone(phone);
  const customer = await Customer.findOne({ phone: normalized }).lean();
  if (!customer) return res.json({ appointments: [] });
  const appointments = await Appointment.find({ customerId: customer._id })
    .populate('serviceId', 'name durationMinutes priceIls')
    .sort({ startTime: -1 })
    .lean();
  res.json({ appointments });
});

router.post('/', async (req, res) => {
  const parsed = createAppointmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });
  }

  const { serviceId, date, startTime, customerName, customerPhone, notes } = parsed.data;

  try {
    await connectDB();

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const [hour, minute] = startTime.split(':').map(Number);
    const startDatetime = setMinutes(setHours(parseISO(date), hour), minute);
    const endDatetime = addMinutes(startDatetime, service.durationMinutes);

    const available = await checkSlotAvailable(startDatetime, endDatetime);
    if (!available) {
      return res.status(409).json({ error: 'slot_taken' });
    }

    // Upsert customer by phone
    const normalizedPhone = normalizePhone(customerPhone);
    let customer = await Customer.findOne({ phone: normalizedPhone });
    if (!customer) {
      customer = await Customer.create({ name: customerName, phone: normalizedPhone });
    } else {
      customer.name = customerName;
      await customer.save();
    }

    // Prevent double-booking: one active future appointment per customer
    const existing = await Appointment.findOne({
      customerId: customer._id,
      status: { $in: ['confirmed', 'pending_verification'] },
      startTime: { $gte: new Date() },
    });
    if (existing) {
      return res.status(409).json({ error: 'already_booked' });
    }

    const appt = await Appointment.create({
      customerId: customer._id,
      serviceId: service._id,
      startTime: startDatetime,
      endTime: endDatetime,
      status: 'confirmed',
      notes,
    });

    res.status(201).json({ appointmentId: appt._id.toString() });
  } catch (err) {
    console.error('Appointment creation error:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// Public customer lookup by phone (for login flow)
router.get('/customer-lookup', async (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  await connectDB();
  try {
    const normalized = normalizePhone(phone);
    const customer = await Customer.findOne({ phone: normalized }).lean();
    res.json({ found: !!customer, name: customer?.name ?? null });
  } catch {
    res.json({ found: false, name: null });
  }
});

router.get('/:id', async (req, res) => {
  await connectDB();
  const appointment = await Appointment.findById(req.params.id)
    .populate('serviceId', 'name durationMinutes priceIls')
    .populate('customerId', 'name')
    .lean();
  if (!appointment) return res.status(404).json({ error: 'Not found' });
  res.json({ appointment });
});

router.post('/:id/cancel', async (req, res) => {
  await connectDB();
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Not found' });
  if (['cancelled', 'completed'].includes(appointment.status)) {
    return res.status(409).json({ error: 'Cannot cancel this appointment' });
  }
  appointment.status = 'cancelled';
  appointment.cancelledAt = new Date();
  appointment.cancelReason = req.body.cancelReason || 'Customer cancelled';
  await appointment.save();
  res.json({ success: true });
});

module.exports = router;
