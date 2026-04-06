import api from './axios'

export const getCartApi      = ()           => api.get('/cart')
export const addToCartApi    = (data)       => api.post('/cart/add', data)
export const updateCartApi   = (id, data)   => api.put(`/cart/item/${id}`, data)
export const removeFromCartApi = (id)       => api.delete(`/cart/item/${id}`)
export const clearCartApi    = ()           => api.delete('/cart/clear')
export const applyCouponApi  = (data)       => api.post('/cart/coupon', data)
export const removeCouponApi = ()           => api.delete('/cart/coupon')