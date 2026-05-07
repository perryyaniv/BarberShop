const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending_verification', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'pending_verification',
    },
    notes: { type: String },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

AppointmentSchema.index({ startTime: 1, status: 1 });
AppointmentSchema.index({ customerId: 1, startTime: -1 });

module.exports = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
