import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers'

export default function OrdersTable({ orders, onStatusChange }) {
  const statuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-3 font-medium">Order</th>
            <th className="pb-3 font-medium">Customer</th>
            <th className="pb-3 font-medium">Total</th>
            <th className="pb-3 font-medium">Payment</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Date</th>
            {onStatusChange && <th className="pb-3 font-medium">Action</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="py-3 font-medium text-indigo-600">{order.orderNumber}</td>
              <td className="py-3">
                <p className="font-medium">{order.user?.name}</p>
                <p className="text-xs text-gray-400">{order.user?.email}</p>
              </td>
              <td className="py-3 font-medium">{formatPrice(order.total)}</td>
              <td className="py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'paid'    ? 'bg-green-100 text-green-700' :
                  order.paymentStatus === 'failed'  ? 'bg-red-100 text-red-700'    :
                  order.paymentStatus === 'refunded'? 'bg-purple-100 text-purple-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.paymentStatus}
                </span>
              </td>
              <td className="py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className="py-3 text-gray-500">{formatDate(order.createdAt)}</td>
              {onStatusChange && (
                <td className="py-3">
                  <select
                    value={order.status}
                    onChange={e => onStatusChange(order._id, e.target.value)}
                    className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}