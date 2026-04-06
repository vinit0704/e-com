import api from './axios'

export const getDashboardStatsApi   = ()          => api.get('/admin/dashboard')
export const getSalesReportApi      = (params)    => api.get('/admin/reports/sales', { params })
export const getProductReportApi    = ()          => api.get('/admin/reports/products')
export const getCustomerReportApi   = ()          => api.get('/admin/reports/customers')
export const getAdminUsersApi       = (params)    => api.get('/admin/users', { params })
export const updateUserRoleApi      = (id, data)  => api.put(`/admin/users/${id}/role`, data)
export const deleteUserApi          = (id)        => api.delete(`/admin/users/${id}`)
export const getAdminOrdersApi      = (params)    => api.get('/admin/orders', { params })
export const updateOrderStatusApi   = (id, data)  => api.put(`/admin/orders/${id}/status`, data)
export const getNewsletterSubsApi   = ()          => api.get('/newsletter')
export const sendNewsletterApi      = (data)      => api.post('/newsletter/send', data)

// ── Products ──────────────────────────────────────────────────────────────────
export const createProductApi = (formData) => api.post('/products', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const updateProductApi = (id, formData) => api.put(`/products/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const deleteProductApi    = (id)  => api.delete(`/products/${id}`)
export const deleteProductImageApi = (productId, imageId) =>
  api.delete(`/products/${productId}/images/${imageId}`)
export const setPrimaryImageApi  = (productId, imageId) =>
  api.put(`/products/${productId}/images/${imageId}/primary`)

// ── Categories ────────────────────────────────────────────────────────────────
export const createCategoryApi = (data) => api.post('/categories', data)
export const updateCategoryApi = (id, data) => api.put(`/categories/${id}`, data)
export const deleteCategoryApi = (id)   => api.delete(`/categories/${id}`)

// ── Coupons ───────────────────────────────────────────────────────────────────
export const getCouponsApi     = ()          => api.get('/coupons')
export const createCouponApi   = (data)      => api.post('/coupons', data)
export const updateCouponApi   = (id, data)  => api.put(`/coupons/${id}`, data)
export const deleteCouponApi   = (id)        => api.delete(`/coupons/${id}`)