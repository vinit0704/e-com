const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
  code:            { type: String, required: true, unique: true, uppercase: true, trim: true },
  type:            { type: String, enum: ['percentage', 'fixed'], required: true },
  value:           { type: Number, required: true, min: 0 },   // % or flat amount
  minOrderAmount:  { type: Number, default: 0 },
  maxDiscount:     { type: Number, default: null },             // cap for percentage coupons
  usageLimit:      { type: Number, default: null },             // null = unlimited
  usedCount:       { type: Number, default: 0 },
  isActive:        { type: Boolean, default: true },
  expiresAt:       { type: Date, default: null },
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // empty = all
}, { timestamps: true })

// Calculate discount amount
couponSchema.methods.calculateDiscount = function (subtotal) {
  if (this.type === 'percentage') {
    const discount = (subtotal * this.value) / 100
    return this.maxDiscount ? Math.min(discount, this.maxDiscount) : discount
  }
  return Math.min(this.value, subtotal)
}

// Validate coupon eligibility
couponSchema.methods.isValid = function (subtotal) {
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' }
  if (this.expiresAt && new Date() > this.expiresAt) return { valid: false, message: 'Coupon has expired' }
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached' }
  if (subtotal < this.minOrderAmount) return { valid: false, message: `Minimum order amount is ₹${this.minOrderAmount}` }
  return { valid: true }
}

module.exports = mongoose.model('Coupon', couponSchema)