import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartItem from '../components/cart/CartItem'
import EmptyCart from '../components/cart/EmptyCart'
import { formatPrice } from '../utils/helpers'

export default function Cart() {
  const { cart, applyCoupon, removeCoupon } = useCart()
  const [code, setCode] = useState('')

  const handleCoupon = async (e) => {
    e.preventDefault()
    const ok = await applyCoupon(code)
    if (ok) setCode('')
  }

  if (!cart?.items?.length) return (
    <div className="max-w-md mx-auto">
      <EmptyCart />
    </div>
  )

  const shippingFee = cart.total >= 500 ? 0 : 50

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Items */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold">Shopping Cart ({cart.items.length} items)</h1>
        <div className="bg-white rounded-xl border p-5">
          {cart.items.map(item => <CartItem key={item._id} item={item} />)}
        </div>

        {/* Coupon */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-medium mb-3">Coupon Code</h3>
          {cart.coupon ? (
            <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
              <span className="text-sm text-green-700 font-medium">
                {cart.coupon.code} applied — saving {formatPrice(cart.discount)}
              </span>
              <button onClick={removeCoupon} className="text-xs text-red-500 hover:underline">Remove</button>
            </div>
          ) : (
            <form onSubmit={handleCoupon} className="flex gap-2">
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                Apply
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border p-5 h-fit sticky top-20 space-y-3">
        <h3 className="font-semibold text-lg">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          {cart.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>− {formatPrice(cart.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Total</span>
            <span className="text-indigo-600">{formatPrice(cart.total + shippingFee)}</span>
          </div>
        </div>
        {cart.total < 500 && (
          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Add {formatPrice(500 - cart.total)} more for free shipping!
          </p>
        )}
        <Link to="/checkout" className="block w-full py-3 bg-indigo-600 text-white rounded-xl text-center font-medium hover:bg-indigo-700">
          Proceed to Checkout
        </Link>
        <Link to="/products" className="block w-full py-2 text-center text-sm text-indigo-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}