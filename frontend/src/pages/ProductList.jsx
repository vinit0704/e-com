import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProductsApi } from '../api/product.api'
import ProductCard from '../components/product/ProductCard'
import ProductFilters from '../components/product/ProductFilters'
import ProductSort from '../components/product/ProductSort'
import Pagination from '../components/common/Pagination'
import Spinner from '../components/common/Spinner'

export default function ProductList() {
  const [searchParams]              = useSearchParams()
  const [products,  setProducts]   = useState([])
  const [total,     setTotal]      = useState(0)
  const [totalPages,setTotalPages] = useState(1)
  const [loading,   setLoading]    = useState(true)
  const [filters,   setFilters]    = useState({
    keyword:    searchParams.get('keyword')    || '',
    categoryId: searchParams.get('categoryId') || '',
    minPrice:   '',
    maxPrice:   '',
    rating:     '',
    sort:       'newest',
    page:       1,
    limit:      12,
  })

  useEffect(() => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
    getProductsApi(params)
      .then(res => {
        setProducts(res.data.data)
        setTotal(res.data.total)
        setTotalPages(res.data.totalPages)
      })
      .finally(() => setLoading(false))
  }, [filters])

  return (
    <div className="flex gap-6">
      {/* Sidebar filters */}
      <aside className="hidden md:block w-64 shrink-0">
        <ProductFilters filters={filters} onChange={setFilters} />
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {filters.keyword && (
          <p className="text-sm text-gray-500 mb-3">
            Results for <span className="font-medium text-gray-900">"{filters.keyword}"</span>
          </p>
        )}

        <ProductSort
          value={filters.sort}
          onChange={v => setFilters(f => ({ ...f, sort: v, page: 1 }))}
          total={total}
        />

        {loading ? <Spinner /> : products.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-medium">No products found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        <Pagination
          page={filters.page}
          totalPages={totalPages}
          onPageChange={p => setFilters(f => ({ ...f, page: p }))}
        />
      </div>
    </div>
  )
}