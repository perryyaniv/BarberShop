const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema(
  {
    name: {
      he: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      he: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    logoUrl: { type: String },
    galleryUrls: [{ type: String }],
    socialLinks: {
      instagram: { type: String },
      facebook: { type: String },
      whatsapp: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Shop || mongoose.model('Shop', ShopSchema);
