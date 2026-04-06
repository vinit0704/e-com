import api from './axios'

export const getAddressesApi  = ()         => api.get('/addresses')
export const addAddressApi    = (data)     => api.post('/addresses', data)
export const updateAddressApi = (id, data) => api.put(`/addresses/${id}`, data)
export const deleteAddressApi = (id)       => api.delete(`/addresses/${id}`)
export const setDefaultApi    = (id)       => api.put(`/addresses/${id}/default`)