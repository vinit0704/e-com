const mongoose = require('mongoose')
const Product  = require('./Product.model')

const reviewSchema = new mongoose.Schema({
  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   { type: String, required: true },
  comment: { type: String, required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true })

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true })

// Auto-update product rating after save
reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } },
  ])
  await Product.findByIdAndUpdate(productId, {
    rating:     stats[0]?.avgRating  || 0,
    numReviews: stats[0]?.numReviews || 0,
  })
}

reviewSchema.post('save',             function () { this.constructor.calcAverageRating(this.product) })
reviewSchema.post('findOneAndDelete', function (doc) { if (doc) doc.constructor.calcAverageRating(doc.product) })

module.exports = mongoose.model('Review', reviewSchema)