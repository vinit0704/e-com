const Review  = require('../models/Review.model')
const Product = require('../models/Product.model')

exports.createReview = async (req, res) => {
  const { productId, rating, title, comment } = req.body

  const product = await Product.findById(productId)
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

  const review = await Review.create({
    product: productId, rating, title, comment, user: req.user._id,
  })
  await review.populate('user', 'name')

  res.status(201).json({ success: true, review })
}

exports.getProductReviews = async (req, res) => {
  const page  = parseInt(req.query.page)  || 1
  const limit = parseInt(req.query.limit) || 10

  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId })
          .populate('user', 'name')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
    Review.countDocuments({ product: req.params.productId }),
  ])

  res.json({ success: true, reviews, total, page, totalPages: Math.ceil(total / limit) })
}

exports.updateReview = async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' })
  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not your review' })
  }

  const updated = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  res.json({ success: true, review: updated })
}

exports.deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' })

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' })
  }

  await review.deleteOne()
  res.json({ success: true, message: 'Review deleted' })
}