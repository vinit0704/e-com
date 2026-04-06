import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-semibold mb-3">ShopKart</h3>
          <p className="text-sm">Your one-stop shop for everything.</p>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-white">All Products</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login"  className="hover:text-white">Login</Link></li>
            <li><Link to="/orders" className="hover:text-white">My Orders</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3">Support</h4>
          <p className="text-sm">support@shopkart.com</p>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs">
        © {new Date().getFullYear()} ShopKart. All rights reserved.
      </div>
    </footer>
  )
}