import { NavLink } from 'react-router-dom'

const links = [
  { to: '/admin',             label: 'Dashboard',   icon: '📊' },
  { to: '/admin/orders',      label: 'Orders',      icon: '📦' },
  { to: '/admin/products',    label: 'Products',    icon: '🛍️'  },
  { to: '/admin/categories',  label: 'Categories',  icon: '🗂️'  },
  { to: '/admin/coupons',     label: 'Coupons',     icon: '🎟️'  },
  { to: '/admin/users',       label: 'Users',       icon: '👥' },
  { to: '/admin/reports',     label: 'Reports',     icon: '📈' },
  { to: '/admin/newsletter',  label: 'Newsletter',  icon: '📧' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-gray-900 min-h-screen flex flex-col">
      <div className="px-6 py-5 border-b border-gray-700">
        <h2 className="text-white font-bold text-lg">Admin Panel</h2>
        <p className="text-gray-400 text-xs mt-0.5">ShopKart</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}