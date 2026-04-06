import { useState, useEffect } from 'react'
import { getDashboardStatsApi } from '../../api/admin.api'
import StatCard from '../../components/admin/StatCard'
import { RevenueLineChart } from '../../components/admin/RevenueChart'
import OrdersTable from '../../components/admin/OrdersTable'
import Spinner from '../../components/common/Spinner'
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers'
import { getSalesReportApi } from '../../api/admin.api'

export default function Dashboard() {
  const [stats,       setStats]       = useState(null)
  const [chartData,   setChartData]   = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      getDashboardStatsApi(),
      getSalesReportApi({ period: 'monthly' }),
    ]).then(([statsRes, salesRes]) => {
      setStats(statsRes.data)
      setChartData(salesRes.data.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner size="lg" />

  const { stats: s, recentOrders, lowStockProducts, orderStatusStats } = stats

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, Admin</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue"   value={formatPrice(s.thisMonthRevenue)} subtitle="This month" icon="💰" color="indigo" trend={s.revenueGrowth} />
        <StatCard title="Total Orders"    value={s.totalOrders}    subtitle={`${s.todayOrders} today`}    icon="📦" color="green"  />
        <StatCard title="Pending Orders"  value={s.pendingOrders}  subtitle="Need attention"              icon="⏳" color="amber"  />
        <StatCard title="Total Users"     value={s.totalUsers}     subtitle="Registered customers"        icon="👥" color="purple" />
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
        <RevenueLineChart data={chartData} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <OrdersTable orders={recentOrders} />
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Low Stock Alert</h2>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-500">All products are well stocked</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map(p => (
                <div key={p._id} className="flex justify-between items-center">
                  <p className="text-sm text-gray-700 truncate flex-1">{p.name}</p>
                  <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                    p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {p.stock === 0 ? 'Out' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order status breakdown */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Order Status Breakdown</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {orderStatusStats.map(s => (
            <div key={s._id} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{s.count}</p>
              <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(s._id)}`}>
                {s._id}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}