const { z } = require('zod');

const israeliPhoneRegex = /^(\+972|972|0)(5[0-9]|[23489])[0-9]{7}$/;

const phoneSchema = z.string().regex(israeliPhoneRegex, 'Invalid Israeli phone number');
const otpSchema = z.string().length(6).regex(/^\d{6}$/, 'Must be 6 digits');

const createAppointmentSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().min(2),
  notes: z.string().max(500).optional(),
});

const serviceSchema = z.object({
  name: z.object({
    he: z.string().min(1),
    en: z.string().min(1),
  }),
  description: z.object({
    he: z.string().default(''),
    en: z.string().default(''),
  }),
  durationMinutes: z.number().int().min(5).max(480),
  priceIls: z.number().min(0),
  category: z.enum(['haircut', 'beard', 'combo', 'other']),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

const blockedSlotSchema = z.object({
  startDatetime: z.string().datetime(),
  endDatetime: z.string().datetime(),
  reason: z.string().max(200).optional(),
});

const walkInSchema = z.object({
  serviceId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().min(2),
  customerPhone: z.string().min(9),
  notes: z.string().optional(),
});

function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('972')) return `+${digits}`;
  if (digits.startsWith('0')) return `+972${digits.slice(1)}`;
  return `+${digits}`;
}

module.exports = {
  phoneSchema, otpSchema, createAppointmentSchema,
  serviceSchema, blockedSlotSchema, walkInSchema, normalizePhone,
};
