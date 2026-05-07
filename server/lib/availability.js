const {
  startOfDay, endOfDay, addMinutes, format, parseISO, isBefore,
} = require('date-fns');
const { connectDB } = require('./db');
const WorkingHours = require('../models/WorkingHours');
const BlockedSlot = require('../models/BlockedSlot');
const Appointment = require('../models/Appointment');

const SLOT_INTERVAL_MINUTES = 15;

async function getAvailableSlots(dateStr, durationMinutes) {
  await connectDB();

  const date = parseISO(dateStr);
  const dayOfWeek = date.getDay();

  const workingHours = await WorkingHours.findOne({ dayOfWeek, isActive: true });
  if (!workingHours) return [];

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [blockedSlots, appointments] = await Promise.all([
    BlockedSlot.find({ startDatetime: { $lt: dayEnd }, endDatetime: { $gt: dayStart } }),
    // Fetch every appointment that overlaps this day (start before dayEnd AND end after dayStart)
    Appointment.find({
      startTime: { $lt: dayEnd },
      endTime: { $gt: dayStart },
      status: { $nin: ['cancelled', 'no_show'] },
    }),
  ]);

  const [openHour, openMin] = workingHours.startTime.split(':').map(Number);
  const [closeHour, closeMin] = workingHours.endTime.split(':').map(Number);

  const openTime = new Date(date);
  openTime.setHours(openHour, openMin, 0, 0);

  const closeTime = new Date(date);
  closeTime.setHours(closeHour, closeMin, 0, 0);

  const slots = [];
  let cursor = openTime;

  while (true) {
    const slotEnd = addMinutes(cursor, durationMinutes);
    if (slotEnd > closeTime) break;

    const isBlocked = blockedSlots.some((b) => isOverlapping(cursor, slotEnd, b.startDatetime, b.endDatetime));
    const isBooked = appointments.some((a) => {
      const apptEnd = a.endTime ?? addMinutes(a.startTime, 30); // fallback if endTime missing
      return isOverlapping(cursor, slotEnd, a.startTime, apptEnd);
    });
    const isPast = isBefore(cursor, new Date());

    slots.push({
      startTime: format(cursor, 'HH:mm'),
      endTime: format(slotEnd, 'HH:mm'),
      available: !isBlocked && !isBooked && !isPast,
    });

    cursor = addMinutes(cursor, SLOT_INTERVAL_MINUTES);
  }

  return slots;
}

function isOverlapping(start1, end1, start2, end2) {
  return start1 < end2 && end1 > start2;
}

async function checkSlotAvailable(startTime, endTime) {
  await connectDB();

  const [blocked, booked] = await Promise.all([
    BlockedSlot.findOne({ startDatetime: { $lt: endTime }, endDatetime: { $gt: startTime } }),
    Appointment.findOne({
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      status: { $nin: ['cancelled', 'no_show'] },
    }),
  ]);

  return !blocked && !booked;
}

module.exports = { getAvailableSlots, checkSlotAvailable };
