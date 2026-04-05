const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name:     { type: String, required: true, unique: true, trim: true },
  slug:     { type: String, required: true, unique: true, lowercase: true },
  parent:   { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

// Virtual: get children
categorySchema.virtual('children', {
  ref:          'Category',
  localField:   '_id',
  foreignField: 'parent',
})

module.exports = mongoose.model('Category', categorySchema)