const Coupon = require('../models/Coupon.model')

exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body)
    res.status(201).json({ success: true, coupon })
  } catch (err) { next(err) }
}

exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 })
    res.json({ success: true, coupons })
  } catch (err) { next(err) }
}

exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' })
    res.json({ success: true, coupon })
  } catch (err) { next(err) }
}

exports.deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Coupon deleted' })
  } catch (err) { next(err) }
}

exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body
    const coupon = await Coupon.findOne({ code: code.toUpperCase() })
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' })

    const check = coupon.isValid(parseFloat(subtotal))
    if (!check.valid) return res.status(400).json({ success: false, message: check.message })

    const discount = coupon.calculateDiscount(parseFloat(subtotal))
    res.json({
      success:  true,
      coupon:   { code: coupon.code, type: coupon.type, value: coupon.value },
      discount: parseFloat(discount.toFixed(2)),
    })
  } catch (err) { next(err) }
}