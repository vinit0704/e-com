const Product  = require('../models/Product.model')
const { sendEmail } = require('./sendEmail')
const { lowStockAlertTemplate } = require('./emailTemplates')

const LOW_STOCK_THRESHOLD = parseInt(process.env.LOW_STOCK_THRESHOLD) || 5

const checkLowStock = async (product) => {
  if (product.stock <= LOW_STOCK_THRESHOLD && product.stock > 0) {
    console.warn(`⚠️  Low stock: ${product.name} — ${product.stock} left`)
    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to:      process.env.ADMIN_EMAIL,
        subject: `Low Stock Alert: ${product.name}`,
        html:    lowStockAlertTemplate([{ name: product.name, stock: product.stock }]),
      })
    }
  }
  if (product.stock === 0) {
    console.warn(`❌ Out of stock: ${product.name}`)
    await Product.findByIdAndUpdate(product._id, { isActive: false })
  }
}

const reduceStock = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product)
    if (!product) continue
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}`)
    }
    product.stock -= item.quantity
    await product.save()
    await checkLowStock(product)
  }
}

const restoreStock = async (items) => {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
      isActive: true,
    })
  }
}

module.exports = { reduceStock, restoreStock, checkLowStock }