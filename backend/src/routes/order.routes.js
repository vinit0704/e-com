const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/order.controller')
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware')

// Stripe webhook — raw body needed
router.post('/webhook', express.raw({ type: 'application/json' }), ctrl.stripeWebhook)

// User routes
router.post('/',                   verifyToken, ctrl.placeOrder)
router.get('/my-orders',           verifyToken, ctrl.getMyOrders)
router.get('/:id',                 verifyToken, ctrl.getOrder)
router.put('/:id/cancel',          verifyToken, ctrl.cancelOrder)
router.put('/:id/confirm-payment', verifyToken, ctrl.confirmPayment)

// Admin routes
router.get( '/admin/all',          verifyToken, requireAdmin, ctrl.getAllOrders)
router.get( '/admin/stats',        verifyToken, requireAdmin, ctrl.getOrderStats)
router.put( '/admin/:id/status',   verifyToken, requireAdmin, ctrl.updateOrderStatus)

module.exports = router