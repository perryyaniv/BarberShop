const express = require('express');
const { sendOtp, verifyOtp } = require('../lib/otp');
const { phoneSchema, otpSchema, normalizePhone } = require('../lib/validations');

const router = express.Router();

router.post('/send', async (req, res) => {
  const { phone, locale = 'he' } = req.body;
  const parsed = phoneSchema.safeParse(phone);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }
  const normalizedPhone = normalizePhone(phone);
  const result = await sendOtp(normalizedPhone, locale);
  if (!result.success) {
    if (result.cooldown) {
      return res.status(429).json({ error: 'cooldown', cooldown: result.cooldown });
    }
    return res.status(500).json({ error: result.error });
  }
  res.json({ success: true });
});

router.post('/verify', async (req, res) => {
  const { phone, code } = req.body;
  const phoneParsed = phoneSchema.safeParse(phone);
  const codeParsed = otpSchema.safeParse(code);
  if (!phoneParsed.success || !codeParsed.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const normalizedPhone = normalizePhone(phone);
  const result = await verifyOtp(normalizedPhone, code);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true });
});

module.exports = router;
