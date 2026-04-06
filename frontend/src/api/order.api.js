import api from './axios'

export const placeOrderApi    = (data) => api.post('/orders', data)
export const getMyOrdersApi   = (params) => api.get('/orders/my-orders', { params })
export const getOrderApi      = (id)   => api.get(`/orders/${id}`)
export const cancelOrderApi   = (id, data) => api.put(`/orders/${id}/cancel`, data)