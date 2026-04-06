import { useState, useEffect } from 'react'
import { getSalesReportApi, getProductReportApi, getCustomerReportApi } from '../../api/admin.api'
import { RevenueLineChart, RevenueBarChart } from '../../components/admin/RevenueChart'
import StatCard from '../../components/admin/StatCard'
import Spinner from '../../components/common/Spinner'
import { formatPrice } from '../../utils/helpers'

export default function AdminReports() {
  const [sales,     setSales]     = useState([])
  const [products,  setProducts]  = useState(null)
  const [customers, setCustomers] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [period,    setPeriod]    = useState('monthly')
  const [chartType, setChartType] = useState('line')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getSalesReportApi({ period }),
      getProductReportApi(),
      getCustomerReportApi(),
    ]).then(([s, p, c]) => {
      setSales(s.data.data)
      setProducts(p.data)
      setCustomers(c.data)
    }).finally(() => setLoading(false))
  }, [period])

  if (loading) return <Spinner size="lg" />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>

      {/* Sales chart */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Sales Report</h2>
          <div className="flex gap-2">
            {['daily','weekly','monthly'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${period === p ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setChartType(t => t === 'line' ? 'bar' : 'line')}
              className="px-3 py-1 rounded-lg text-xs bg-gray-100 text-gray-600 hover:bg-gray-200">
              {chartType === 'line' ? 'Bar' : 'Line'}
            </button>
          </div>
        </div>
        {chartType === 'line' ? <RevenueLineChart data={sales} /> : <RevenueBarChart data={sales} />}
      </div>

      {/* Product performance */}
      {products && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold mb-4">Top Products by Revenue</h2>
            <div className="space-y-3">
              {products.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.sold} units sold</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600">{formatPrice(p.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold mb-4">Inventory Status</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{products.totalProducts}</p>
                <p className="text-xs text-green-700 mt-1">Active products</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{products.outOfStock}</p>
                <p className="text-xs text-red-700 mt-1">Out of stock</p>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Low Stock Items</h3>
            {products.lowStock.map(p => (
              <div key={p._id} className="flex justify-between text-sm py-1">
                <span className="text-gray-600 truncate">{p.name}</span>
                <span className={`font-medium ${p.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                  {p.stock === 0 ? 'Out' : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer analytics */}
      {customers && (
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-6 mb-5">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold">{customers.totalUsers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">New This Month</p>
              <p className="text-2xl font-bold text-green-600">+{customers.newThisMonth}</p>
            </div>
          </div>
          <h3 className="font-medium mb-3">Top Customers</h3>
          <div className="space-y-2">
            {customers.topCustomers.map((c, i) => (
              <div key={c._id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.orders} orders</p>
                  </div>
                </div>
                <span className="font-semibold text-indigo-600">{formatPrice(c.totalSpent)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}