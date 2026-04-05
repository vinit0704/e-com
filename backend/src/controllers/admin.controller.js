const Order   = require('../models/Order.model')
const Product = require('../models/Product.model')
const User    = require('../models/User.model')
const mongoose = require('mongoose')

// ── Dashboard stats ───────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {
    const now       = new Date()
    const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalOrders, totalUsers, totalProducts,
      pendingOrders, todayOrders,
      thisMonthRevenue, lastMonthRevenue,
      recentOrders, lowStockProducts,
      orderStatusStats,
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ createdAt: { $gte: today } }),

      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: thisMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: lastMonth, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),

      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
      Product.find({ stock: { $lte: 5 }, isActive: true }).select('name stock').limit(10),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ])

    const thisRev = thisMonthRevenue[0]?.total || 0
    const lastRev = lastMonthRevenue[0]?.total || 0
    const revenueGrowth = lastRev === 0 ? 100 : parseFloat(((thisRev - lastRev) / lastRev * 100).toFixed(1))

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalUsers,
        totalProducts,
        pendingOrders,
        todayOrders,
        thisMonthRevenue: thisRev,
        lastMonthRevenue: lastRev,
        revenueGrowth,
      },
      recentOrders,
      lowStockProducts,
      orderStatusStats,
    })
  } catch (err) { next(err) }
}

// ── Sales report ──────────────────────────────────────────────────────────────
exports.getSalesReport = async (req, res, next) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query

    let groupBy, dateFilter

    if (period === 'daily') {
      const month = parseInt(req.query.month) || new Date().getMonth() + 1
      dateFilter = {
        $gte: new Date(year, month - 1, 1),
        $lt:  new Date(year, month, 1),
      }
      groupBy = {
        year:  { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day:   { $dayOfMonth: '$createdAt' },
      }
    } else if (period === 'weekly') {
      dateFilter = {
        $gte: new Date(year, 0, 1),
        $lt:  new Date(parseInt(year) + 1, 0, 1),
      }
      groupBy = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' },
      }
    } else {
      dateFilter = {
        $gte: new Date(year, 0, 1),
        $lt:  new Date(parseInt(year) + 1, 0, 1),
      }
      groupBy = {
        year:  { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      }
    }

    const salesData = await Order.aggregate([
      { $match: { createdAt: dateFilter, paymentStatus: 'paid' } },
      {
        $group: {
          _id:      groupBy,
          revenue:  { $sum: '$total' },
          orders:   { $sum: 1 },
          avgOrder: { $avg: '$total' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
    ])

    // Fill missing months with 0
    if (period === 'monthly') {
      const months = Array.from({ length: 12 }, (_, i) => {
        const found = salesData.find(d => d._id.month === i + 1)
        return {
          label:   new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
          revenue: found?.revenue   || 0,
          orders:  found?.orders    || 0,
          avgOrder: found?.avgOrder || 0,
        }
      })
      return res.json({ success: true, period, data: months })
    }

    res.json({ success: true, period, data: salesData })
  } catch (err) { next(err) }
}

// ── Product performance ───────────────────────────────────────────────────────
exports.getProductPerformance = async (req, res, next) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id:      '$items.product',
          name:     { $first: '$items.name' },
          sold:     { $sum: '$items.quantity' },
          revenue:  { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ])

    const lowStock = await Product.find({ stock: { $lte: parseInt(process.env.LOW_STOCK_THRESHOLD) || 5 } })
      .select('name stock price').sort({ stock: 1 }).limit(10)

    const outOfStock = await Product.countDocuments({ stock: 0 })
    const totalProducts = await Product.countDocuments({ isActive: true })

    res.json({ success: true, topProducts, lowStock, outOfStock, totalProducts })
  } catch (err) { next(err) }
}

// ── Customer analytics ────────────────────────────────────────────────────────
exports.getCustomerAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' })
    const newThisMonth = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    })

    const topCustomers = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$user', totalSpent: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', email: '$user.email', totalSpent: 1, orders: 1 } },
    ])

    const userGrowth = await User.aggregate([
      { $match: { role: 'user' } },
      {
        $group: {
          _id:   { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ])

    res.json({ success: true, totalUsers, newThisMonth, topCustomers, userGrowth })
  } catch (err) { next(err) }
}

// ── User management ───────────────────────────────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 20
    const query = {}
    if (req.query.role)   query.role   = req.query.role
    if (req.query.search) query.$or = [
      { name:  { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ]

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(query),
    ])
    res.json({ success: true, users, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' })
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, user })
  } catch (err) { next(err) }
}

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' })
    }
    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'User deleted' })
  } catch (err) { next(err) }
}