import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Layout from './components/layout/Layout'
import Toast from './components/common/Toast'

import Home              from './pages/Home'
import ProductList       from './pages/ProductList'
import ProductDetail     from './pages/ProductDetail'
import Cart              from './pages/Cart'
import Checkout          from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import OrderHistory      from './pages/OrderHistory'
import Login             from './pages/Login'
import Register          from './pages/Register'

import AdminLayout     from './pages/admin/AdminLayout'
import Dashboard       from './pages/admin/Dashboard'
import AdminOrders     from './pages/admin/AdminOrders'
import AdminProducts   from './pages/admin/AdminProducts'
import AdminUsers      from './pages/admin/AdminUsers'
import AdminReports    from './pages/admin/AdminReports'
import AdminNewsletter from './pages/admin/AdminNewsletter'
import AdminCategories from './pages/admin/AdminCategories'
import AdminCoupons    from './pages/admin/AdminCoupons'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toast />
          <Routes>
            {/* Public routes with layout */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/products"               element={<Layout><ProductList /></Layout>} />
            <Route path="/products/:id"           element={<Layout><ProductDetail /></Layout>} />
            <Route path="/cart"                   element={<Layout><Cart /></Layout>} />
            <Route path="/checkout"               element={<Layout><Checkout /></Layout>} />
            <Route path="/order-confirmation/:id" element={<Layout><OrderConfirmation /></Layout>} />
            <Route path="/orders"                 element={<Layout><OrderHistory /></Layout>} />
            <Route path="/login"                  element={<Layout><Login /></Layout>} />
            <Route path="/register"               element={<Layout><Register /></Layout>} />

            {/* Admin routes — no main layout, own sidebar */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index            element={<Dashboard />} />
              <Route path="orders"    element={<AdminOrders />} />
              <Route path="products"  element={<AdminProducts />} />
              <Route path="users"     element={<AdminUsers />} />
              <Route path="reports"   element={<AdminReports />} />
              <Route path="newsletter" element={<AdminNewsletter />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="coupons"    element={<AdminCoupons />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
