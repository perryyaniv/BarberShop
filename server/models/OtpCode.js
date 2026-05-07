const mongoose = require('mongoose');

const OtpCodeSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpCodeSchema.index({ phone: 1 });

module.exports = mongoose.models.OtpCode || mongoose.model('OtpCode', OtpCodeSchema);
