require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const Shop = require('../models/Shop')

const GALLERY_URLS = Array.from({ length: 11 }, (_, i) => `/Gallery${i + 1}.JPG`)

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  const shop = await Shop.findOne()
  if (!shop) { console.error('No shop document found'); process.exit(1) }
  shop.galleryUrls = GALLERY_URLS
  await shop.save()
  console.log('Gallery updated:', GALLERY_URLS)
  await mongoose.disconnect()
}

run().catch((err) => { console.error(err); process.exit(1) })
