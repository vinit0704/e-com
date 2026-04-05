const Product   = require('../models/Product.model')
const cloudinary = require('../config/cloudinary')

exports.getProducts = async (req, res) => {
  const { keyword, minPrice, maxPrice, categoryId, rating, sort, page = 1, limit = 12 } = req.query

  const query = { isActive: true }

  if (keyword) query.$text = { $search: keyword }
  if (categoryId) query.category = categoryId
  if (minPrice || maxPrice) query.price = {
    ...(minPrice && { $gte: parseFloat(minPrice) }),
    ...(maxPrice && { $lte: parseFloat(maxPrice) }),
  }
  if (rating) query.rating = { $gte: parseFloat(rating) }

  const sortMap = {
    price_asc:   { price: 1 },
    price_desc:  { price: -1 },
    rating_desc: { rating: -1 },
    newest:      { createdAt: -1 },
  }
  const sortBy = sortMap[sort] || { createdAt: -1 }

  const skip  = (parseInt(page) - 1) * parseInt(limit)
  const [data, total] = await Promise.all([
    Product.find(query).populate('category', 'name slug').sort(sortBy).skip(skip).limit(parseInt(limit)),
    Product.countDocuments(query),
  ])

  res.json({ success: true, data, total, page: parseInt(page), totalPages: Math.ceil(total / limit) })
}

exports.getProduct = async (req, res) => {
  const product = await Product.findOne({
    $or: [
      { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
      { slug: req.params.id }
    ],
    isActive: true,
  }).populate('category', 'name slug')

  if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
  res.json({ success: true, product })
}
exports.createProduct = async (req, res, next) => {
  try {
    console.log('📦 Body:', req.body)
    console.log('📁 Files:', req.files)

    const { name, description, price, stock, categoryId, variants, images } = req.body

    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, price and categoryId',
      })
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') +
                 '-' + Date.now().toString(36)

    // ✅ Handle both form-data (files) and JSON (image URLs)
    let productImages = []

    if (req.files && req.files.length > 0) {
      // form-data with file upload
      productImages = req.files.map((file, i) => ({
        url:       file.path || `memory://${file.originalname}`,
        publicId:  file.filename || file.originalname,
        isPrimary: i === 0,
      }))
    } else if (images && Array.isArray(images)) {
      // JSON with image URLs array
      productImages = images.map((img, i) => ({
        url:       typeof img === 'string' ? img : img.url,
        publicId:  typeof img === 'string' ? `img_${i}` : img.publicId || `img_${i}`,
        isPrimary: i === 0,
      }))
    } else if (images && typeof images === 'string') {
      // Single image URL as string
      productImages = [{ url: images, publicId: 'img_0', isPrimary: true }]
    }

    // Parse variants — works for both JSON and form-data string
    let parsedVariants = []
    if (variants) {
      try {
        parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid variants format' })
      }
    }

    const product = await Product.create({
      name,
      description,
      slug,
      price:    parseFloat(price),
      stock:    parseInt(stock || 0),
      category: categoryId,
      images:   productImages,
      variants: parsedVariants,
    })

    await product.populate('category', 'name slug')

    res.status(201).json({ success: true, product })
  } catch (err) {
    console.error('❌ Create product error:', err.message)
    next(err)
  }
}



exports.updateProduct = async (req, res) => {
  const { name, description, price, stock, categoryId, isActive } = req.body
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

  if (name)        product.name        = name
  if (description) product.description = description
  if (price)       product.price       = parseFloat(price)
  if (stock !== undefined) product.stock = parseInt(stock)
  if (categoryId)  product.category    = categoryId
  if (isActive !== undefined) product.isActive = isActive === 'true'

  if (req.files?.length) {
    const newImages = req.files.map(file => ({
      url: file.path, publicId: file.filename, isPrimary: false,
    }))
    product.images.push(...newImages)
  }

  await product.save()
  res.json({ success: true, product })
}

exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

  await Promise.all(product.images.map(img => cloudinary.uploader.destroy(img.publicId)))
  await product.deleteOne()

  res.json({ success: true, message: 'Product deleted' })
}

exports.deleteProductImage = async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

  const image = product.images.id(req.params.imageId)
  if (!image) return res.status(404).json({ success: false, message: 'Image not found' })

  await cloudinary.uploader.destroy(image.publicId)
  image.deleteOne()
  await product.save()

  res.json({ success: true, message: 'Image deleted' })
}

exports.setPrimaryImage = async (req, res) => {
  const product = await Product.findById(req.params.productId)
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

  product.images.forEach(img => { img.isPrimary = img._id.toString() === req.params.imageId })
  await product.save()

  res.json({ success: true, message: 'Primary image updated' })
}