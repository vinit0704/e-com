import { useState, useEffect } from 'react'
import { getCategoriesApi } from '../../api/product.api'

export default function ProductFilters({ filters, onChange }) {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    getCategoriesApi().then(res => setCategories(res.data.categories))
  }, [])

  const handle = (key, value) => onChange({ ...filters, [key]: value, page: 1 })

  return (
    <div className="bg-white rounded-xl border p-5 space-y-6 sticky top-20">
      <h3 className="font-semibold text-gray-900">Filters</h3>

      {/* Category */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio" name="cat" value=""
              checked={!filters.categoryId}
              onChange={() => handle('categoryId', '')}
            />
            All Categories
          </label>
          {categories.map(cat => (
            <label key={cat._id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio" name="cat" value={cat._id}
                checked={filters.categoryId === cat._id}
                onChange={() => handle('categoryId', cat._id)}
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
        <div className="flex gap-2">
          <input
            type="number" placeholder="Min"
            value={filters.minPrice || ''}
            onChange={e => handle('minPrice', e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
          />
          <input
            type="number" placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={e => handle('maxPrice', e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Min Rating</h4>
        <div className="space-y-1">
          {[4, 3, 2, 1].map(r => (
            <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio" name="rating" value={r}
                checked={Number(filters.rating) === r}
                onChange={() => handle('rating', r)}
              />
              {'★'.repeat(r)}{'☆'.repeat(5 - r)} & up
            </label>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => onChange({ page: 1, limit: 12 })}
        className="w-full text-sm text-indigo-600 hover:underline"
      >
        Clear all filters
      </button>
    </div>
  )
}