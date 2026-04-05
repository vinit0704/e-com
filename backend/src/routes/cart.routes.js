const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/cart.controller')
const { verifyToken } = require('../middleware/auth.middleware')

// Optional auth middleware — works for both guest and logged-in users
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      const jwt  = require('jsonwebtoken')
      const User = require('../models/User.model')
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id)
    }
  } catch {}
  next()
}

router.get(   '/',              optionalAuth, ctrl.getCart)
router.post(  '/add',          optionalAuth, ctrl.addItem)
router.put(   '/item/:itemId', optionalAuth, ctrl.updateItem)
router.delete('/item/:itemId', optionalAuth, ctrl.removeItem)
router.delete('/clear',        optionalAuth, ctrl.clearCart)
router.post(  '/coupon',       optionalAuth, ctrl.applyCoupon)
router.delete('/coupon',       optionalAuth, ctrl.removeCoupon)
router.post(  '/merge',        verifyToken,  ctrl.mergeCarts)

module.exports = router