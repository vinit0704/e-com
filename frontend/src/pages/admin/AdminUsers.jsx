import { useState, useEffect } from 'react'
import { getAdminUsersApi, updateUserRoleApi, deleteUserApi } from '../../api/admin.api'
import Spinner from '../../components/common/Spinner'
import Pagination from '../../components/common/Pagination'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users,   setUsers]   = useState([])
  const [total,   setTotal]   = useState(1)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await getAdminUsersApi({ page, limit: 20, search })
      setUsers(res.data.users)
      setTotal(Math.ceil(res.data.total / 20))
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [page, search])

  const handleRole = async (id, role) => {
    try {
      await updateUserRoleApi(id, { role })
      toast.success('Role updated')
      fetchUsers()
    } catch { toast.error('Failed to update role') }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return
    try {
      await deleteUserApi(id)
      toast.success('User deleted')
      fetchUsers()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64"
        />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? <Spinner /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isEmailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {user.isEmailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={e => handleRole(user._id, e.target.value)}
                      className="text-xs border rounded px-2 py-1 focus:outline-none"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(user._id, user.name)} className="text-xs text-red-500 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={total} onPageChange={setPage} />
    </div>
  )
}