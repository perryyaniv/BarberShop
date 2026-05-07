const express = require('express');
const { connectDB } = require('../lib/db');
const Shop = require('../models/Shop');
const Service = require('../models/Service');
const WorkingHours = require('../models/WorkingHours');

const router = express.Router();

router.get('/shop', async (req, res) => {
  await connectDB();
  const shop = await Shop.findOne().lean();
  res.json({ shop });
});

router.get('/services', async (req, res) => {
  await connectDB();
  const services = await Service.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
  res.json({ services });
});

router.get('/working-hours', async (req, res) => {
  await connectDB();
  const hours = await WorkingHours.find().sort({ dayOfWeek: 1 }).lean();
  res.json({ hours });
});

module.exports = router;
