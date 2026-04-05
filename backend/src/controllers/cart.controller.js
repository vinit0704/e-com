const Cart    = require('../models/Cart.model')
const Product = require('../models/Product.model')
const Coupon  = require('../models/Coupon.model')

// Helper: find cart by user or sessionId
const findCart = async (req) => {
  if (req.user) {
    return Cart.findOne({ user: req.user._id }).populate('items.product', 'name price stock images isActive')
  }
  const sessionId = req.headers['x-session-id']
  if (!sessionId) return null
  return Cart.findOne({ sessionId }).populate('items.product', 'name price stock images isActive')
}

// Helper: create new cart
const createCart = (req) => {
  if (req.user) return new Cart({ user: req.user._id, items: [] })
  const sessionId = req.headers['x-session-id']
  return new Cart({ sessionId, items: [] })
}

// ── Get cart ──────────────────────────────────────────────────────────────────
exports.getCart = async (req, res, next) => {
  try {
    let cart = await findCart(req)
    if (!cart) return res.json({ success: true, cart: { items: [], subtotal: 0 } })

    await cart.populate('coupon', 'code type value')

    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    let discount   = 0

    if (cart.coupon) {
      const check = cart.coupon.isValid(subtotal)
      if (check.valid) discount = cart.coupon.calculateDiscount(subtotal)
    }

    res.json({
      success: true,
      cart: {
        _id:      cart._id,
        items:    cart.items,
        coupon:   cart.coupon,
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        total:    parseFloat((subtotal - discount).toFixed(2)),
      },
    })
  } catch (err) { next(err) }
}

// ── Add item to cart ──────────────────────────────────────────────────────────
exports.addItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1, variantId } = req.body

    const product = await Product.findById(productId)
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' })
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock` })
    }

    let cart = await findCart(req)
    if (!cart) cart = createCart(req)

    // Get variant info if provided
    let variantInfo = {}
    let itemPrice   = product.price

    if (variantId) {
      const variant = product.variants.id(variantId)
      if (variant) {
        variantInfo = { name: variant.name, value: variant.value }
        if (variant.price) itemPrice = variant.price
      }
    }

    // Check if item already in cart
    const existingIndex = cart.items.findIndex(
      item => item.product.toString() === productId &&
              (variantId ? item.variantId?.toString() === variantId : !item.variantId)
    )

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + parseInt(quantity)
      if (newQty > product.stock) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} items available` })
      }
      cart.items[existingIndex].quantity = newQty
    } else {
      cart.items.push({
        product:     productId,
        quantity:    parseInt(quantity),
        price:       itemPrice,
        variantId:   variantId || null,
        variantInfo,
      })
    }

    await cart.save()
    await cart.populate('items.product', 'name price images stock')

    res.json({ success: true, message: 'Item added to cart', cart })
  } catch (err) { next(err) }
}

// ── Update item quantity ──────────────────────────────────────────────────────
exports.updateItem = async (req, res, next) => {
  try {
    const { itemId }  = req.params
    const { quantity } = req.body

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' })
    }

    const cart = await findCart(req)
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' })

    const item = cart.items.id(itemId)
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' })

    const product = await Product.findById(item.product)
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock` })
    }

    item.quantity = parseInt(quantity)
    await cart.save()
    await cart.populate('items.product', 'name price images stock')

    res.json({ success: true, message: 'Cart updated', cart })
  } catch (err) { next(err) }
}

// ── Remove item ───────────────────────────────────────────────────────────────
exports.removeItem = async (req, res, next) => {
  try {
    const cart = await findCart(req)
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' })

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId)
    await cart.save()

    res.json({ success: true, message: 'Item removed', cart })
  } catch (err) { next(err) }
}

// ── Clear cart ────────────────────────────────────────────────────────────────
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await findCart(req)
    if (!cart) return res.json({ success: true, message: 'Cart already empty' })

    cart.items  = []
    cart.coupon = null
    await cart.save()

    res.json({ success: true, message: 'Cart cleared' })
  } catch (err) { next(err) }
}

// ── Apply coupon ──────────────────────────────────────────────────────────────
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body
    const cart = await findCart(req)
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' })
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() })
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' })

    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const check    = coupon.isValid(subtotal)
    if (!check.valid) return res.status(400).json({ success: false, message: check.message })

    const discount = coupon.calculateDiscount(subtotal)
    cart.coupon    = coupon._id
    await cart.save()

    res.json({
      success:  true,
      message:  'Coupon applied',
      discount: parseFloat(discount.toFixed(2)),
      total:    parseFloat((subtotal - discount).toFixed(2)),
    })
  } catch (err) { next(err) }
}

// ── Remove coupon ─────────────────────────────────────────────────────────────
exports.removeCoupon = async (req, res, next) => {
  try {
    const cart = await findCart(req)
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' })

    cart.coupon = null
    await cart.save()

    res.json({ success: true, message: 'Coupon removed' })
  } catch (err) { next(err) }
}

// ── Merge guest cart into user cart (called after login) ─────────────────────
exports.mergeCarts = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id']
    if (!sessionId) return res.json({ success: true, message: 'No guest cart to merge' })

    const guestCart = await Cart.findOne({ sessionId })
    if (!guestCart || guestCart.items.length === 0) {
      return res.json({ success: true, message: 'No guest cart items to merge' })
    }

    let userCart = await Cart.findOne({ user: req.user._id })
    if (!userCart) {
      userCart = new Cart({ user: req.user._id, items: [] })
    }

    // Merge items
    for (const guestItem of guestCart.items) {
      const exists = userCart.items.findIndex(
        i => i.product.toString() === guestItem.product.toString()
      )
      if (exists > -1) {
        userCart.items[exists].quantity += guestItem.quantity
      } else {
        userCart.items.push(guestItem)
      }
    }

    await userCart.save()
    await Cart.deleteOne({ sessionId })

    res.json({ success: true, message: 'Carts merged', cart: userCart })
  } catch (err) { next(err) }
}