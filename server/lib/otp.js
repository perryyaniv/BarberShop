const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { connectDB } = require('./db');
const OtpCode = require('../models/OtpCode');
const { sendSms, formatOtpMessage } = require('./sms');

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 60;

function generateCode() {
  return String(crypto.randomInt(100000, 999999));
}

async function sendOtp(phone, locale = 'he') {
  await connectDB();

  const recent = await OtpCode.findOne({
    phone,
    createdAt: { $gt: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) },
  });

  if (recent) {
    const elapsed = Math.floor((Date.now() - recent.createdAt.getTime()) / 1000);
    return { success: false, cooldown: RESEND_COOLDOWN_SECONDS - elapsed, error: 'cooldown' };
  }

  await OtpCode.deleteMany({ phone });

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await OtpCode.create({ phone, codeHash, expiresAt, verified: false, attempts: 0 });

  const message = formatOtpMessage(code, locale);
  return sendSms(phone, message);
}

async function verifyOtp(phone, code) {
  await connectDB();

  const record = await OtpCode.findOne({ phone, verified: false }).sort({ createdAt: -1 });

  if (!record || record.expiresAt < new Date()) {
    return { success: false, error: 'expired' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return { success: false, error: 'max_attempts' };
  }

  const isValid = await bcrypt.compare(code, record.codeHash);

  if (!isValid) {
    record.attempts += 1;
    await record.save();
    if (record.attempts >= MAX_ATTEMPTS) {
      return { success: false, error: 'max_attempts' };
    }
    return { success: false, error: 'invalid' };
  }

  record.verified = true;
  await record.save();
  return { success: true };
}

module.exports = { sendOtp, verifyOtp };
