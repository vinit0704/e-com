import api from './axios'

export const getProductsApi  = (params) => api.get('/products', { params })
export const getProductApi   = (id)     => api.get(`/products/${id}`)
export const getCategoriesApi = ()      => api.get('/categories')
export const getReviewsApi   = (id, params) => api.get(`/reviews/product/${id}`, { params })
export const createReviewApi = (data)   => api.post('/reviews', data)