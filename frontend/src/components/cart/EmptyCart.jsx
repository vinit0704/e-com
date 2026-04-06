import { Link } from 'react-router-dom'

export default function EmptyCart({ onClose }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4">🛒</div>
      <h3 className="text-lg font-semibold text-gray-900">Your cart is empty</h3>
      <p className="text-sm text-gray-500 mt-1">Add some products to get started</p>
      <Link
        to="/products"
        onClick={onClose}
        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700"
      >
        Browse Products
      </Link>
    </div>
  )
}