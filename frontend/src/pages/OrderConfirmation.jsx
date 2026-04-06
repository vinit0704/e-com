import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrderApi } from '../api/order.api'
import Spinner from '../components/common/Spinner'
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers'

export default function OrderConfirmation() {
  const { id }                = useParams()
  const [order, setOrder]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrderApi(id).then(res => setOrder(res.data.order)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner size="lg" />
  if (!order)  return <div className="text-center py-16 text-gray-500">Order not found</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success header */}
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900">Order Placed!</h1>
        <p className="text-gray-500 mt-1">Order #{order.orderNumber}</p>
        <span className={`mt-3 inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      {/* Order details */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold">Order Items</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm py-2 border-b last:border-0">
            <span className="text-gray-700">{item.name} × {item.quantity}</span>
            <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="space-y-1 text-sm pt-2">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>− {formatPrice(order.discount)}</span></div>}
          <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{formatPrice(order.shippingFee)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatPrice(order.tax)}</span></div>
          <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span className="text-indigo-600">{formatPrice(order.total)}</span></div>
        </div>
      </div>

      {/* Shipping address */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-2">Shipping to</h2>
        <p className="text-sm text-gray-600">
          {order.shippingAddress.fullName}<br />
          {order.shippingAddress.street}, {order.shippingAddress.city}<br />
          {order.shippingAddress.state} {order.shippingAddress.pincode}
        </p>
      </div>

      {/* Estimated delivery */}
      <div className="bg-indigo-50 rounded-xl p-4 text-center">
        <p className="text-sm text-indigo-700">
          Estimated delivery by <span className="font-semibold">{formatDate(order.estimatedDelivery)}</span>
        </p>
      </div>

      <div className="flex gap-3">
        <Link to="/orders" className="flex-1 py-3 border rounded-xl text-center text-sm hover:bg-gray-50">
          View All Orders
        </Link>
        <Link to="/products" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-center text-sm hover:bg-indigo-700">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}