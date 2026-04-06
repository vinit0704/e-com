import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import StarRating from '../common/StarRating'
import { formatPrice, truncate } from '../../utils/helpers'

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart()
  const image = product.images?.[0]?.url || 'https://placehold.co/300x300?text=No+Image'

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group">
      <Link to={`/products/${product._id}`}>
        <div className="aspect-square overflow-hidden bg-gray-50">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-medium text-gray-900 hover:text-indigo-600 transition-colors">
            {truncate(product.name, 50)}
          </h3>
        </Link>

        <p className="text-xs text-gray-500 mt-1">{product.category?.name}</p>

        <div className="flex items-center gap-2 mt-2">
          <StarRating rating={product.rating} />
          <span className="text-xs text-gray-400">({product.numReviews})</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-indigo-600">{formatPrice(product.price)}</span>
          {product.stock === 0 ? (
            <span className="text-xs text-red-500 font-medium">Out of stock</span>
          ) : product.stock <= 5 ? (
            <span className="text-xs text-orange-500">Only {product.stock} left</span>
          ) : null}
        </div>

        <button
          onClick={() => addToCart(product._id)}
          disabled={loading || product.stock === 0}
          className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}