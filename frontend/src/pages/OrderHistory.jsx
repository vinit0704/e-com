import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrdersApi, cancelOrderApi } from '../api/order.api'
import Spinner from '../components/common/Spinner'
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function OrderHistory() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = () => {
    setLoading(true)
    getMyOrdersApi().then(res => setOrders(res.data.orders)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return
    try {
      await cancelOrderApi(id, { reason: 'Cancelled by user' })
      toast.success('Order cancelled')
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order')
    }
  }

  if (loading) return <Spinner size="lg" />

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-500">No orders yet</p>
          <Link to="/products" className="mt-4 inline-block text-indigo-600 hover:underline">Start shopping</Link>
        </div>
      ) : orders.map(order => (
        <div key={order._id} className="bg-white rounded-xl border p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{order.orderNumber}</p>
              <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="text-sm text-gray-600">
            {order.items.length} item{order.items.length > 1 ? 's' : ''} · {formatPrice(order.total)}
            <span className="ml-2 text-gray-400">via {order.paymentMethod.toUpperCase()}</span>
          </div>

          <div className="flex gap-2">
            <Link to={`/order-confirmation/${order._id}`} className="text-sm text-indigo-600 hover:underline">
              View Details
            </Link>
            {['pending', 'confirmed'].includes(order.status) && (
              <button onClick={() => handleCancel(order._id)} className="text-sm text-red-500 hover:underline ml-3">
                Cancel
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}