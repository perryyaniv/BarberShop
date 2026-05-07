const mongoose = require('mongoose');

const BlockedSlotSchema = new mongoose.Schema(
  {
    startDatetime: { type: Date, required: true },
    endDatetime: { type: Date, required: true },
    reason: { type: String },
  },
  { timestamps: true }
);

BlockedSlotSchema.index({ startDatetime: 1, endDatetime: 1 });

module.exports = mongoose.models.BlockedSlot || mongoose.model('BlockedSlot', BlockedSlotSchema);
