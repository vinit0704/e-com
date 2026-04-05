const mongoose = require('mongoose')

const variantSchema = new mongoose.Schema({
  name:  { type: String, required: true }, // e.g. "Color"
  value: { type: String, required: true }, // e.g. "Red"
  price: { type: Number },
  stock: { type: Number, default: 0 },
})

const imageSchema = new mongoose.Schema({
  url:       { type: String, required: true },
  publicId:  { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
})

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },
  stock:       { type: Number, default: 0, min: 0 },
  rating:      { type: Number, default: 0, min: 0, max: 5 },
  numReviews:  { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images:      [imageSchema],
  variants:    [variantSchema],
}, { timestamps: true })

// Text index for search
productSchema.index({ name: 'text', description: 'text' })

module.exports = mongoose.model('Product', productSchema)