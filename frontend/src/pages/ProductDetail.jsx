import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductApi, getReviewsApi, createReviewApi } from '../api/product.api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import ProductImages from '../components/product/ProductImages'
import VariantSelector from '../components/product/VariantSelector'
import ReviewCard from '../components/product/ReviewCard'
import StarRating from '../components/common/StarRating'
import Spinner from '../components/common/Spinner'
import { formatPrice } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id }                      = useParams()
  const { addToCart, loading }      = useCart()
  const { user }                    = useAuth()
  const [product,   setProduct]     = useState(null)
  const [reviews,   setReviews]     = useState([])
  const [variant,   setVariant]     = useState(null)
  const [qty,       setQty]         = useState(1)
  const [pageLoad,  setPageLoad]    = useState(true)
  const [review,    setReview]      = useState({ rating: 5, title: '', comment: '' })
  const [submitting,setSubmitting]  = useState(false)

  useEffect(() => {
    setPageLoad(true)
    Promise.all([getProductApi(id), getReviewsApi(id)])
      .then(([pRes, rRes]) => {
        setProduct(pRes.data.product)
        setReviews(rRes.data.reviews)
      })
      .finally(() => setPageLoad(false))
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addToCart(product._id, qty, variant?._id || null)
  }

  const handleReview = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await createReviewApi({ productId: product._id, ...review })
      toast.success('Review submitted!')
      const res = await getReviewsApi(id)
      setReviews(res.data.reviews)
      setReview({ rating: 5, title: '', comment: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (pageLoad) return <Spinner size="lg" />
  if (!product)  return <div className="text-center py-16 text-gray-500">Product not found</div>

  const price = variant?.price || product.price
  const stock = variant?.stock ?? product.stock

  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <ProductImages images={product.images} />

        {/* Info */}
        <div className="space-y-5">
          <div>
            <Link to={`/products?categoryId=${product.category?._id}`} className="text-xs text-indigo-600 hover:underline">
              {product.category?.name}
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={product.rating} size="md" />
              <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
            </div>
          </div>

          <div className="text-3xl font-bold text-indigo-600">{formatPrice(price)}</div>

          <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

          {/* Variants */}
          <VariantSelector variants={product.variants} selected={variant} onSelect={setVariant} />

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium text-gray-700">Quantity</label>
            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-gray-100">−</button>
              <span className="w-8 text-center font-medium">{qty}</span>
              <button onClick={() => setQty(q => Math.min(stock, q + 1))} className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-gray-100">+</button>
              <span className="text-sm text-gray-500">{stock} available</span>
            </div>
          </div>

          {/* Stock status */}
          {stock === 0 ? (
            <div className="bg-red-50 text-red-600 rounded-lg px-4 py-2 text-sm">Out of stock</div>
          ) : stock <= 5 ? (
            <div className="bg-orange-50 text-orange-600 rounded-lg px-4 py-2 text-sm">Only {stock} left!</div>
          ) : null}

          <button
            onClick={handleAddToCart}
            disabled={loading || stock === 0}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="border-t pt-8 space-y-6">
        <h2 className="text-xl font-bold">Customer Reviews</h2>

        {/* Write review */}
        {user && (
          <form onSubmit={handleReview} className="bg-gray-50 rounded-xl p-5 space-y-3">
            <h3 className="font-medium">Write a Review</h3>
            <div>
              <label className="text-sm text-gray-600">Rating</label>
              <StarRating rating={review.rating} size="lg" onChange={r => setReview(p => ({ ...p, rating: r }))} />
            </div>
            <input
              required placeholder="Review title"
              value={review.title}
              onChange={e => setReview(p => ({ ...p, title: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <textarea
              required placeholder="Share your experience..."
              rows={3}
              value={review.comment}
              onChange={e => setReview(p => ({ ...p, comment: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button type="submit" disabled={submitting} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Review list */}
        <div className="space-y-4">
          {reviews.length === 0
            ? <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
            : reviews.map(r => <ReviewCard key={r._id} review={r} />)
          }
        </div>
      </div>
    </div>
  )
}