const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity:  { type: Number, required: true, min: 1, default: 1 },
  price:     { type: Number, required: true },   // snapshot at add time
  variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
  variantInfo: {
    name:  { type: String },
    value: { type: String },
  },
})

const cartSchema = new mongoose.Schema({
  // Logged-in user cart
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Guest cart (browser session ID)
  sessionId: { type: String, default: null },
  items:     [cartItemSchema],
  coupon:    { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // 7 days
}, { timestamps: true })

// Auto-delete expired guest carts
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
cartSchema.index({ user: 1 })
cartSchema.index({ sessionId: 1 })

// Virtual: subtotal
cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

cartSchema.set('toJSON', { virtuals: true })
cartSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Cart', cartSchema)