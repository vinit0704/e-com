const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:        { type: String, required: true },   // snapshot
  image:       { type: String },                   // snapshot
  quantity:    { type: Number, required: true, min: 1 },
  price:       { type: Number, required: true },   // snapshot at order time
  variantInfo: {
    name:  String,
    value: String,
  },
})

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String, required: true },
  note:      { type: String },
  updatedAt: { type: Date, default: Date.now },
})

const orderSchema = new mongoose.Schema({
  orderNumber:  { type: String, unique: true },
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:        [orderItemSchema],

  // Address snapshot (not a ref — so deleting address doesn't break order history)
  shippingAddress: {
    fullName: String,
    phone:    String,
    street:   String,
    city:     String,
    state:    String,
    pincode:  String,
    country:  String,
  },

  // Pricing
  subtotal:     { type: Number, required: true },
  discount:     { type: Number, default: 0 },
  shippingFee:  { type: Number, default: 0 },
  tax:          { type: Number, default: 0 },
  total:        { type: Number, required: true },

  // Coupon
  couponCode:   { type: String },
  couponId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },

  // Payment
  paymentMethod:  { type: String, enum: ['stripe', 'cod'], required: true },
  paymentStatus:  { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  stripePaymentIntentId: { type: String },
  paidAt:         { type: Date },

  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  statusHistory: [statusHistorySchema],

  // Delivery
  estimatedDelivery: { type: Date },
  deliveredAt:       { type: Date },
  cancelReason:      { type: String },
}, { timestamps: true })

// Auto-generate order number before save


module.exports = mongoose.model('Order', orderSchema)