import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getCartApi, addToCartApi, updateCartApi,
  removeFromCartApi, clearCartApi,
  applyCouponApi, removeCouponApi,
} from '../api/cart.api'
import toast from 'react-hot-toast'

// ✅ named export
export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart,        setCart]        = useState({ items: [], subtotal: 0, discount: 0, total: 0 })
  const [loading,     setLoading]     = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', 'guest-' + Date.now())
    }
    fetchCart()
  }, [])

  const fetchCart = useCallback(async () => {
    try {
      const res = await getCartApi()
      setCart(res.data.cart)
    } catch {}
  }, [])

  const addToCart = async (productId, quantity = 1, variantId = null) => {
    try {
      setLoading(true)
      const res = await addToCartApi({ productId, quantity, variantId })
      setCart(res.data.cart)
      setSidebarOpen(true)
      toast.success('Added to cart!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart')
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (itemId, quantity) => {
    try {
      const res = await updateCartApi(itemId, { quantity })
      setCart(res.data.cart)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart')
    }
  }

  const removeItem = async (itemId) => {
    try {
      const res = await removeFromCartApi(itemId)
      setCart(res.data.cart)
      toast.success('Item removed')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const clearCart = async () => {
    try {
      await clearCartApi()
      setCart({ items: [], subtotal: 0, discount: 0, total: 0 })
    } catch {}
  }

  const applyCoupon = async (code) => {
    try {
      const res = await applyCouponApi({ code })
      await fetchCart()
      toast.success(`Coupon applied! You saved ₹${res.data.discount}`)
      return true
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon')
      return false
    }
  }

  const removeCoupon = async () => {
    try {
      await removeCouponApi()
      await fetchCart()
      toast.success('Coupon removed')
    } catch {}
  }

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <CartContext.Provider value={{
      cart, loading, sidebarOpen, cartCount,
      setSidebarOpen, fetchCart,
      addToCart, updateItem, removeItem, clearCart,
      applyCoupon, removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  )
}

// ✅ also export hook directly from context file
export const useCart = () => useContext(CartContext)