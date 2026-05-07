const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, default: null },
    phoneVerified: { type: Boolean, default: false },
    localePref: { type: String, enum: ['he', 'en'], default: 'he' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
