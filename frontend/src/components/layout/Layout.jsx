import Navbar from './Navbar'
import Footer from './Footer'
import { useCart } from '../../context/CartContext'
import CartSidebar from '../cart/CartSidebar'

export default function Layout({ children }) {
  const { sidebarOpen, setSidebarOpen } = useCart()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
      <Footer />
      <CartSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  )
}
