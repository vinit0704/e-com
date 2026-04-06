import { useState } from 'react'
import { placeOrderApi } from '../../api/order.api'
import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function PaymentStep({ addressId, onBack }) {
  const [method,  setMethod]  = useState('cod')
  const [placing, setPlacing] = useState('')
  const { clearCart }         = useCart()
  const navigate              = useNavigate()

  const handleOrder = async () => {
    try {
      setPlacing(true)
      const res = await placeOrderApi({ addressId, paymentMethod: method })
      await clearCart()
      toast.success('Order placed successfully!')
      navigate(`/order-confirmation/${res.data.order._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Payment Method</h2>

      {/* COD */}
      <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer ${method === 'cod' ? 'border-indigo-500 bg-indigo-50' : 'hover:border-gray-300'}`}>
        <input type="radio" name="payment" value="cod" checked={method === 'cod'} onChange={() => setMethod('cod')} className="mt-0.5" />
        <div>
          <p className="font-medium text-sm">Cash on Delivery</p>
          <p className="text-xs text-gray-500">Pay when your order arrives</p>
        </div>
      </label>

      {/* Stripe */}
      <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer ${method === 'stripe' ? 'border-indigo-500 bg-indigo-50' : 'hover:border-gray-300'}`}>
        <input type="radio" name="payment" value="stripe" checked={method === 'stripe'} onChange={() => setMethod('stripe')} className="mt-0.5" />
        <div>
          <p className="font-medium text-sm">Credit / Debit Card</p>
          <p className="text-xs text-gray-500">Secure payment via Stripe</p>
        </div>
      </label>

      {method === 'stripe' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
          Stripe test mode — use card: 4242 4242 4242 4242, any future date, any CVV
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 border rounded-xl text-sm hover:bg-gray-50">
          Back
        </button>
        <button
          onClick={handleOrder}
          disabled={placing}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {placing ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  )
}