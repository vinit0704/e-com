import { formatPrice } from '../../utils/helpers'

export default function OrderSummary({ cart }) {
  const shippingFee = cart.total >= 500 ? 0 : 50
  const tax         = parseFloat(((cart.total - cart.discount) * 0.18).toFixed(2))
  const grandTotal  = cart.total + shippingFee + tax

  return (
    <div className="bg-white rounded-xl border p-5 space-y-3 sticky top-20">
      <h3 className="font-semibold text-gray-900">Order Summary</h3>

      <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
        {cart.items?.map(item => (
          <div key={item._id} className="flex justify-between text-gray-600">
            <span className="truncate flex-1">{item.product?.name} × {item.quantity}</span>
            <span className="ml-2">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 space-y-2 text-sm">
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
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (18%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t pt-2">
          <span>Total</span>
          <span className="text-indigo-600">{formatPrice(grandTotal)}</span>
        </div>
      </div>

      {cart.total < 500 && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded p-2">
          Add {formatPrice(500 - cart.total)} more for free shipping!
        </p>
      )}
    </div>
  )
}