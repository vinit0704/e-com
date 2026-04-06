import { useState, useEffect } from 'react'
import { getCouponsApi, createCouponApi, updateCouponApi, deleteCouponApi } from '../../api/admin.api'
import Spinner from '../../components/common/Spinner'
import { formatDate, formatPrice } from '../../utils/helpers'
import toast from 'react-hot-toast'

const EMPTY = {
  code: '', type: 'percentage', value: '', minOrderAmount: '',
  maxDiscount: '', usageLimit: '', isActive: true,
  expiresAt: '',
}

export default function AdminCoupons() {
  const [coupons,   setCoupons]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editCoupon,setEditCoupon]= useState(null)
  const [form,      setForm]      = useState(EMPTY)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await getCouponsApi()
      setCoupons(res.data.coupons)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const openAdd = () => { setEditCoupon(null); setForm(EMPTY); setShowModal(true) }
  const openEdit = (coupon) => {
    setEditCoupon(coupon)
    setForm({
      code:           coupon.code,
      type:           coupon.type,
      value:          coupon.value,
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscount:    coupon.maxDiscount    || '',
      usageLimit:     coupon.usageLimit     || '',
      isActive:       coupon.isActive,
      expiresAt:      coupon.expiresAt
                        ? new Date(coupon.expiresAt).toISOString().split('T')[0]
                        : '',
    })
    setShowModal(true)
  }
  const close = () => { setShowModal(false); setEditCoupon(null); setForm(EMPTY) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const data = {
        code:           form.code.toUpperCase(),
        type:           form.type,
        value:          parseFloat(form.value),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : 0,
        maxDiscount:    form.maxDiscount    ? parseFloat(form.maxDiscount)    : null,
        usageLimit:     form.usageLimit     ? parseInt(form.usageLimit)       : null,
        isActive:       form.isActive,
        expiresAt:      form.expiresAt      ? new Date(form.expiresAt)        : null,
      }
      if (editCoupon) {
        await updateCouponApi(editCoupon._id, data)
        toast.success('Coupon updated!')
      } else {
        await createCouponApi(data)
        toast.success('Coupon created!')
      }
      close(); fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return
    try {
      await deleteCouponApi(id)
      toast.success('Coupon deleted')
      fetch()
    } catch { toast.error('Failed to delete coupon') }
  }

  const handleToggle = async (coupon) => {
    try {
      await updateCouponApi(coupon._id, { isActive: !coupon.isActive })
      toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`)
      fetch()
    } catch { toast.error('Failed to update') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button
          onClick={openAdd}
          className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? <Spinner /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Min Order</th>
                <th className="px-4 py-3 font-medium">Usage</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {c.type === 'percentage'
                      ? `${c.value}%${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}`
                      : `₹${c.value} off`
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.minOrderAmount ? formatPrice(c.minOrderAmount) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.usedCount}/{c.usageLimit || '∞'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.expiresAt ? formatDate(c.expiresAt) : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(c)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-xs">
                      <button onClick={() => openEdit(c)}          className="text-indigo-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(c._id, c.code)} className="text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold">{editCoupon ? 'Edit Coupon' : 'Add Coupon'}</h2>
              <button onClick={close} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

              {/* Code */}
              <div>
                <label className="text-sm font-medium text-gray-700">Coupon Code *</label>
                <input
                  required value={form.code}
                  onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  disabled={!!editCoupon}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50"
                  placeholder="SAVE10"
                />
              </div>

              {/* Type + Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Type *</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Value * {form.type === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    required type="number" min="0"
                    max={form.type === 'percentage' ? 100 : undefined}
                    value={form.value}
                    onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder={form.type === 'percentage' ? '10' : '50'}
                  />
                </div>
              </div>

              {/* Min Order + Max Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Min Order (₹)</label>
                  <input
                    type="number" min="0" value={form.minOrderAmount}
                    onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="0"
                  />
                </div>
                {form.type === 'percentage' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Max Discount (₹)</label>
                    <input
                      type="number" min="0" value={form.maxDiscount}
                      onChange={e => setForm(p => ({ ...p, maxDiscount: e.target.value }))}
                      className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="500"
                    />
                  </div>
                )}
              </div>

              {/* Usage Limit + Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Usage Limit</label>
                  <input
                    type="number" min="1" value={form.usageLimit}
                    onChange={e => setForm(p => ({ ...p, usageLimit: e.target.value }))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="date" value={form.expiresAt}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox" id="couponActive"
                  checked={form.isActive}
                  onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-indigo-600"
                />
                <label htmlFor="couponActive" className="text-sm font-medium text-gray-700">
                  Active (usable by customers)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={close} className="flex-1 py-2.5 border rounded-xl text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? 'Saving...' : editCoupon ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}