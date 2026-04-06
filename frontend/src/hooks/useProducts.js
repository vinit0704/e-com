import { useState, useEffect, useCallback } from 'react'
import { getProductsApi } from '../api/product.api'

export const useProducts = (initialFilters = {}) => {
  const [products,   setProducts]   = useState([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [filters,    setFilters]    = useState({
    page:  1,
    limit: 12,
    sort:  'newest',
    ...initialFilters,
  })

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Remove empty values before sending
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      )
      const res = await getProductsApi(params)
      setProducts(res.data.data)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const changePage = (page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const resetFilters = () => {
    setFilters({ page: 1, limit: 12, sort: 'newest' })
  }

  return {
    products,
    total,
    totalPages,
    loading,
    error,
    filters,
    updateFilter,
    updateFilters,
    changePage,
    resetFilters,
    refetch: fetchProducts,
  }
}