import { useState, useEffect } from 'react'
import { getAddressesApi, addAddressApi } from '../../api/address.api'
import toast from 'react-hot-toast'

export default function AddressStep({ onNext }) {
  const [addresses,   setAddresses]   = useState([])
  const [selected,    setSelected]    = useState(null)
  const [showForm,    setShowForm]    = useState(false)
  const [form,        setForm]        = useState({ fullName:'', phone:'', street:'', city:'', state:'', pincode:'', country:'India' })
  const [saving,      setSaving]      = useState(false)

  useEffect(() => {
    getAddressesApi().then(res => {
      setAddresses(res.data.addresses)
      const def = res.data.addresses.find(a => a.isDefault) || res.data.addresses[0]
      if (def) setSelected(def._id)
      if (!res.data.addresses.length) setShowForm(true)
    })
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await addAddressApi({ ...form, isDefault: !addresses.length })
      setAddresses(prev => [...prev, res.data.address])
      setSelected(res.data.address._id)
      setShowForm(false)
      toast.success('Address saved')
    } catch {
      toast.error('Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { key: 'fullName', label: 'Full Name', col: 2 },
    { key: 'phone',    label: 'Phone',     col: 1 },
    { key: 'street',   label: 'Street',    col: 2 },
    { key: 'city',     label: 'City',      col: 1 },
    { key: 'state',    label: 'State',     col: 1 },
    { key: 'pincode',  label: 'Pincode',   col: 1 },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Shipping Address</h2>

      {/* Saved addresses */}
      {addresses.map(addr => (
        <label key={addr._id} className={`flex gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${selected === addr._id ? 'border-indigo-500 bg-indigo-50' : 'hover:border-gray-300'}`}>
          <input type="radio" name="address" value={addr._id} checked={selected === addr._id} onChange={() => setSelected(addr._id)} className="mt-1" />
          <div className="text-sm">
            <p className="font-medium">{addr.fullName} · {addr.phone}</p>
            <p className="text-gray-600">{addr.street}, {addr.city}, {addr.state} {addr.pincode}</p>
          </div>
        </label>
      ))}

      {/* Add new address form */}
      {showForm ? (
        <form onSubmit={handleSave} className="border rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.key} className={f.col === 2 ? 'col-span-2' : ''}>
                <label className="text-xs font-medium text-gray-600">{f.label}</label>
                <input
                  required
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Address'}
            </button>
            {addresses.length > 0 && (
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)} className="text-sm text-indigo-600 hover:underline">
          + Add new address
        </button>
      )}

      <button
        onClick={() => selected ? onNext(selected) : toast.error('Please select an address')}
        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
      >
        Continue to Payment
      </button>
    </div>
  )
}