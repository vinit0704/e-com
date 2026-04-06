import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
  const { user, logout }           = useAuth()
  const { cartCount, setSidebarOpen } = useCart()
  const navigate                   = useNavigate()
  const [search, setSearch]        = [window.__search || '', (v) => { window.__search = v }]

  const handleSearch = (e) => {
    e.preventDefault()
    const q = e.target.search.value.trim()
    if (q) navigate(`/products?keyword=${q}`)
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40 border-b">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 gap-4">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-indigo-600 shrink-0">
          ShopKart
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <input
              name="search"
              placeholder="Search products..."
              className="w-full border rounded-full px-4 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button type="submit" className="absolute right-3 top-2 text-gray-400 hover:text-indigo-600">
              &#128269;
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/products" className="text-sm text-gray-600 hover:text-indigo-600 hidden sm:block">
            Products
          </Link>

          {/* Cart */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="relative p-2 text-gray-600 hover:text-indigo-600"
          >
            <span className="text-xl">&#128722;</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/orders" className="text-sm text-gray-600 hover:text-indigo-600 hidden sm:block">
                Orders
              </Link>
              <button
                onClick={logout}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="text-sm px-3 py-1.5 rounded-full border hover:bg-gray-50">
                Login
              </Link>
              <Link to="/register" className="text-sm px-3 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}