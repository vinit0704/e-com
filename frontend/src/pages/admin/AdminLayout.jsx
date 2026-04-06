import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/admin/Sidebar'
import Spinner from '../../components/common/Spinner'

export default function AdminLayout() {
  const { user, loading } = useAuth()

  if (loading) return <Spinner size="lg" />
  if (!user || user.role !== 'admin') return <Navigate to="/login" />

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}