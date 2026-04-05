const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/admin.controller')
const orderCtrl = require('../controllers/order.controller')
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware')

// All admin routes require auth + admin role
router.use(verifyToken, requireAdmin)

// Dashboard
router.get('/dashboard',            ctrl.getDashboardStats)

// Reports
router.get('/reports/sales',        ctrl.getSalesReport)
router.get('/reports/products',     ctrl.getProductPerformance)
router.get('/reports/customers',    ctrl.getCustomerAnalytics)

// User management
router.get('/users',                ctrl.getUsers)
router.put('/users/:id/role',       ctrl.updateUserRole)
router.delete('/users/:id',         ctrl.deleteUser)

// Order management (reuse order controller)
router.get('/orders',               orderCtrl.getAllOrders)
router.get('/orders/stats',         orderCtrl.getOrderStats)
router.put('/orders/:id/status',    orderCtrl.updateOrderStatus)

module.exports = router