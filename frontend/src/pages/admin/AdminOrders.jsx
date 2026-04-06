import { useState, useEffect } from 'react'
import { getAdminOrdersApi, updateOrderStatusApi } from '../../api/admin.api'
import OrdersTable from '../../components/admin/OrdersTable'
import Pagination from '../../components/common/Pagination'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [status,  setStatus]  = useState('')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (status) params.status = status
      const res = await getAdminOrdersApi(params)
      setOrders(res.data.orders)
      setTotal(Math.ceil(res.data.total / 20))
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [page, status])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatusApi(orderId, { status: newStatus })
      toast.success('Order status updated')
      fetchOrders()
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">All Status</option>
          {['pending','confirmed','processing','shipped','delivered','cancelled'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border p-5">
        {loading ? <Spinner /> : <OrdersTable orders={orders} onStatusChange={handleStatusChange} />}
      </div>

      <Pagination page={page} totalPages={total} onPageChange={setPage} />
    </div>
  )
}