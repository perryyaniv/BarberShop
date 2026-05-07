const {
  startOfDay, endOfDay, addMinutes, addDays, format, parseISO, isBefore,
} = require('date-fns');
const { connectDB } = require('./db');
const WorkingHours = require('../models/WorkingHours');
const BlockedSlot = require('../models/BlockedSlot');
const Appointment = require('../models/Appointment');
const Shop = require('../models/Shop');

async function getAvailableSlots(dateStr, durationMinutes) {
  await connectDB();

  const date = parseISO(dateStr);
  const dayOfWeek = date.getDay();

  const [workingHours, shop] = await Promise.all([
    WorkingHours.findOne({ dayOfWeek, isActive: true }),
    Shop.findOne().lean(),
  ]);
  if (!workingHours) return [];

  const SLOT_INTERVAL_MINUTES = shop?.slotIntervalMinutes ?? 30;

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [blockedSlots, appointments] = await Promise.all([
    BlockedSlot.find({ startDatetime: { $lt: dayEnd }, endDatetime: { $gt: dayStart } }),
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
      const apptEnd = a.endTime ?? addMinutes(a.startTime, 30);
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

// Returns { [dateStr]: boolean } — true if day has at least one available slot
async function getDaysAvailability(fromDateStr, toDateStr, durationMinutes) {
  await connectDB();

  const from = parseISO(fromDateStr);
  const to = parseISO(toDateStr);

  const [allWorkingHours, shop, blockedSlots, appointments] = await Promise.all([
    WorkingHours.find({ isActive: true }).lean(),
    Shop.findOne().lean(),
    BlockedSlot.find({
      startDatetime: { $lt: endOfDay(to) },
      endDatetime: { $gt: startOfDay(from) },
    }).lean(),
    Appointment.find({
      startTime: { $lt: endOfDay(to) },
      endTime: { $gt: startOfDay(from) },
      status: { $nin: ['cancelled', 'no_show'] },
    }).lean(),
  ]);

  const SLOT_INTERVAL_MINUTES = shop?.slotIntervalMinutes ?? 30;
  const activeWorkingDays = new Map(allWorkingHours.map((h) => [h.dayOfWeek, h]));
  const now = new Date();
  const result = {};
  let current = new Date(from);

  while (current <= to) {
    const dayOfWeek = current.getDay();
    const dateStr = format(current, 'yyyy-MM-dd');
    const workingHours = activeWorkingDays.get(dayOfWeek);

    if (!workingHours) {
      current = addDays(current, 1);
      continue;
    }

    const [openHour, openMin] = workingHours.startTime.split(':').map(Number);
    const [closeHour, closeMin] = workingHours.endTime.split(':').map(Number);

    const openTime = new Date(current);
    openTime.setHours(openHour, openMin, 0, 0);
    const closeTime = new Date(current);
    closeTime.setHours(closeHour, closeMin, 0, 0);

    let hasAvailable = false;
    let cursor = new Date(openTime);

    while (true) {
      const slotEnd = addMinutes(cursor, durationMinutes);
      if (slotEnd > closeTime) break;

      if (!isBefore(cursor, now)) {
        const isBlocked = blockedSlots.some((b) => isOverlapping(cursor, slotEnd, b.startDatetime, b.endDatetime));
        const isBooked = appointments.some((a) => {
          const apptEnd = a.endTime ?? addMinutes(a.startTime, 30);
          return isOverlapping(cursor, slotEnd, a.startTime, apptEnd);
        });
        if (!isBlocked && !isBooked) {
          hasAvailable = true;
          break;
        }
      }

      cursor = addMinutes(cursor, SLOT_INTERVAL_MINUTES);
    }

    result[dateStr] = hasAvailable;
    current = addDays(current, 1);
  }

  return result;
}

function isOverlapping(start1, end1, start2, end2) {
  return start1 < end2 && end1 > start2;
}

// session param makes the check part of an ongoing MongoDB transaction
async function checkSlotAvailable(startTime, endTime, session = null) {
  const opts = session ? { session } : {};

  const [blocked, booked] = await Promise.all([
    BlockedSlot.findOne(
      { startDatetime: { $lt: endTime }, endDatetime: { $gt: startTime } },
      null,
      opts
    ),
    Appointment.findOne(
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
        status: { $nin: ['cancelled', 'no_show'] },
      },
      null,
      opts
    ),
  ]);

  return !blocked && !booked;
}

module.exports = { getAvailableSlots, getDaysAvailability, checkSlotAvailable };
