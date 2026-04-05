const Category = require('../models/Category.model')

exports.getCategories = async (req, res) => {
  const categories = await Category.find({ parent: null }).populate({
    path: 'children', populate: { path: 'children' }
  })
  res.json({ success: true, categories })
}

exports.getCategory = async (req, res) => {
  const category = await Category.findOne({
    $or: [
      { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
      { slug: req.params.id }
    ]
  }).populate('children')
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' })
  res.json({ success: true, category })
}

exports.createCategory = async (req, res) => {
  const { name, parentId } = req.body
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  const category = await Category.create({ name, slug, parent: parentId || null })
  res.status(201).json({ success: true, category })
}

exports.updateCategory = async (req, res) => {
  const { name, parentId } = req.body
  const data = {
    ...(name && { name, slug: name.toLowerCase().replace(/\s+/g, '-') }),
    ...(parentId !== undefined && { parent: parentId || null }),
  }
  const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true })
  res.json({ success: true, category })
}

exports.deleteCategory = async (req, res) => {
  const Product = require('../models/Product.model')
  const count = await Product.countDocuments({ category: req.params.id })
  if (count > 0) return res.status(400).json({
    success: false, message: `Cannot delete: ${count} products use this category`
  })
  await Category.findByIdAndDelete(req.params.id)
  res.json({ success: true, message: 'Category deleted' })
}