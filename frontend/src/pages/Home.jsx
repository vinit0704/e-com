import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProductsApi, getCategoriesApi } from '../api/product.api'
import ProductCard from '../components/product/ProductCard'
import Spinner from '../components/common/Spinner'

export default function Home() {
  const [featured,    setFeatured]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      getProductsApi({ sort: 'rating_desc', limit: 8 }),
      getCategoriesApi(),
    ]).then(([prodRes, catRes]) => {
      setFeatured(prodRes.data.data)
      setCategories(catRes.data.categories)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-10 text-white text-center">
        <h1 className="text-4xl font-bold mb-3">Welcome to ShopKart</h1>
        <p className="text-indigo-100 mb-6">Discover amazing products at unbeatable prices</p>
        <Link to="/products" className="bg-white text-indigo-600 px-8 py-3 rounded-full font-medium hover:bg-indigo-50 transition-colors">
          Shop Now
        </Link>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link
                key={cat._id}
                to={`/products?categoryId=${cat._id}`}
                className="bg-white rounded-xl border p-6 text-center hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <div className="text-3xl mb-2">📦</div>
                <p className="font-medium text-gray-900">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-indigo-600 hover:underline text-sm">View all</Link>
        </div>
        {loading ? <Spinner /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  )
}