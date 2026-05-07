const mongoose = require('mongoose');

const WorkingHoursSchema = new mongoose.Schema({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

WorkingHoursSchema.index({ dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.models.WorkingHours || mongoose.model('WorkingHours', WorkingHoursSchema);
