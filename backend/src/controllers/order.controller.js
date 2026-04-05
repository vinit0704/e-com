const Order    = require('../models/Order.model')
const Cart     = require('../models/Cart.model')
const Product  = require('../models/Product.model')
const Coupon   = require('../models/Coupon.model')
const Address  = require('../models/Address.model')
const stripe   = require('../config/stripe')
const { reduceStock, restoreStock } = require('../utils/stockAlerts')
const { sendEmail }  = require('../utils/sendEmail')
const { orderConfirmationTemplate, shippingUpdateTemplate } = require('../utils/emailTemplates')

const SHIPPING_FEE  = 50
const FREE_SHIPPING = 500
const TAX_RATE      = 0.18

const generateOrderNumber = async () => {
  const count = await Order.countDocuments()
  return 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + (count + 1).toString().padStart(4, '0')
}

exports.placeOrder = async (req, res, next) => {
  try {
    const { addressId, paymentMethod, couponCode } = req.body
    if (!addressId || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Address and payment method required' })
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price stock images isActive')
      .populate('coupon')

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' })
    }

    for (const item of cart.items) {
      if (!item.product?.isActive) {
        return res.status(400).json({ success: false, message: `"${item.product?.name}" is unavailable` })
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Only ${item.product.stock} units of "${item.product.name}" available` })
      }
    }

    const address = await Address.findOne({ _id: addressId, user: req.user._id })
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' })

    const subtotal    = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shippingFee = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE
    let discount = 0, couponId = null
    const couponApplied = couponCode || cart.coupon?.code

    if (couponApplied) {
      const coupon = await Coupon.findOne({ code: couponApplied.toUpperCase() })
      if (coupon) {
        const check = coupon.isValid(subtotal)
        if (check.valid) { discount = coupon.calculateDiscount(subtotal); couponId = coupon._id }
      }
    }

    const taxable = subtotal - discount
    const tax     = parseFloat((taxable * TAX_RATE).toFixed(2))
    const total   = parseFloat((taxable + tax + shippingFee).toFixed(2))

    const orderItems = cart.items.map(item => ({
      product:     item.product._id,
      name:        item.product.name,
      image:       item.product.images?.[0]?.url || '',
      quantity:    item.quantity,
      price:       item.price,
      variantInfo: item.variantInfo,
    }))

    const shippingAddress = {
      fullName: address.fullName, phone: address.phone,
      street:   address.street,  city:  address.city,
      state:    address.state,   pincode: address.pincode,
      country:  address.country,
    }

    const order = await Order.create({
      orderNumber: await generateOrderNumber(),
      user:        req.user._id,
      items:       orderItems,
      shippingAddress,
      subtotal:    parseFloat(subtotal.toFixed(2)),
      discount:    parseFloat(discount.toFixed(2)),
      shippingFee, tax, total,
      couponCode:  couponApplied || undefined,
      couponId:    couponId || undefined,
      paymentMethod,
      paymentStatus: 'pending',
      status:        'pending',
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    await reduceStock(orderItems)
    if (couponId) await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } })
    await Cart.findByIdAndDelete(cart._id)

    // Send confirmation email
    const populatedOrder = await Order.findById(order._id).populate('user', 'name email')
    await sendEmail({
      to:      req.user.email,
      subject: `Order Confirmed — #${order.orderNumber}`,
      html:    orderConfirmationTemplate(populatedOrder),
    })

    let clientSecret = null
    if (paymentMethod === 'stripe') {
      const pi = await stripe.paymentIntents.create({
        amount:   Math.round(total * 100),
        currency: 'inr',
        metadata: { orderId: order._id.toString() },
      })
      clientSecret = pi.client_secret
      await Order.findByIdAndUpdate(order._id, { stripePaymentIntentId: pi.id })
    }

    res.status(201).json({ success: true, message: 'Order placed successfully', order, clientSecret })
  } catch (err) { next(err) }
}

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body
    const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    order.status = status
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` })
    if (status === 'delivered') { order.deliveredAt = new Date(); order.paymentStatus = 'paid' }
    await order.save()

    // Send shipping update email
    if (['shipped', 'delivered', 'confirmed'].includes(status)) {
      await sendEmail({
        to:      order.user.email,
        subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)} — #${order.orderNumber}`,
        html:    shippingUpdateTemplate(order, status),
      })
    }

    res.json({ success: true, message: 'Order status updated', order })
  } catch (err) { next(err) }
}

exports.confirmPayment = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    if (order.paymentMethod !== 'stripe') return res.status(400).json({ success: false, message: 'Not a Stripe order' })

    const pi = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId)
    if (pi.status !== 'succeeded') return res.status(400).json({ success: false, message: 'Payment not completed' })

    order.paymentStatus = 'paid'; order.status = 'confirmed'; order.paidAt = new Date()
    order.statusHistory.push({ status: 'confirmed', note: 'Payment confirmed via Stripe' })
    await order.save()
    res.json({ success: true, message: 'Payment confirmed', order })
  } catch (err) { next(err) }
}

exports.getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const query = { user: req.user._id }
    if (req.query.status) query.status = req.query.status

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select('-statusHistory'),
      Order.countDocuments(query),
    ])
    res.json({ success: true, orders, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

exports.getOrder = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id }
    const order = await Order.findOne(query).populate('user', 'name email')
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    res.json({ success: true, order })
  } catch (err) { next(err) }
}

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel "${order.status}" order` })
    }
    order.status = 'cancelled'
    order.cancelReason = req.body.reason || 'Cancelled by user'
    order.statusHistory.push({ status: 'cancelled', note: order.cancelReason })
    await order.save()
    await restoreStock(order.items)
    if (order.paymentStatus === 'paid' && order.stripePaymentIntentId) {
      await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId })
      order.paymentStatus = 'refunded'; await order.save()
    }
    res.json({ success: true, message: 'Order cancelled', order })
  } catch (err) { next(err) }
}

exports.getAllOrders = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 20
    const query = {}
    if (req.query.status)        query.status        = req.query.status
    if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus

    const [orders, total] = await Promise.all([
      Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Order.countDocuments(query),
    ])
    res.json({ success: true, orders, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

exports.getOrderStats = async (req, res, next) => {
  try {
    const stats   = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, totalRevenue: { $sum: '$total' } } }])
    const revenue = await Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }])
    res.json({ success: true, stats, totalRevenue: revenue[0]?.total || 0 })
  } catch (err) { next(err) }
}

exports.stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature']
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` })
  }
  if (event.type === 'payment_intent.succeeded') {
    const order = await Order.findOne({ stripePaymentIntentId: event.data.object.id })
    if (order) { order.paymentStatus = 'paid'; order.status = 'confirmed'; order.paidAt = new Date(); order.statusHistory.push({ status: 'confirmed', note: 'Payment via webhook' }); await order.save() }
  }
  if (event.type === 'payment_intent.payment_failed') {
    const order = await Order.findOne({ stripePaymentIntentId: event.data.object.id })
    if (order) { order.paymentStatus = 'failed'; order.statusHistory.push({ status: 'pending', note: 'Payment failed' }); await order.save(); await restoreStock(order.items) }
  }
  res.json({ received: true })
}