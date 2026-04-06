import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import CartItem from './CartItem'
import EmptyCart from './EmptyCart'
import { formatPrice } from '../../utils/helpers'

export default function CartSidebar({ open, onClose }) {
  const { cart } = useCart()

  return (
    <>
      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-lg">Shopping Cart ({cart?.items?.length || 0})</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {!cart?.items?.length
            ? <EmptyCart onClose={onClose} />
            : cart.items.map(item => <CartItem key={item._id} item={item} />)
          }
        </div>

        {/* Footer */}
        {cart?.items?.length > 0 && (
          <div className="border-t px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">{formatPrice(cart.subtotal)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>− {formatPrice(cart.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-indigo-600">{formatPrice(cart.total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/cart"
                onClick={onClose}
                className="text-center py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={onClose}
                className="text-center py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}