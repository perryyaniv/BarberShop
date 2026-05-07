const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema(
  {
    name: {
      he: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      he: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    durationMinutes: { type: Number, required: true, min: 5 },
    priceIls: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ['haircut', 'beard', 'combo', 'other'], required: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ServiceSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
