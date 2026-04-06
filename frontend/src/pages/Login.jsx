import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { loginApi } from '../api/auth.api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [form,     setForm]     = useState({ email: '', password: '' })
  const [loading,  setLoading]  = useState(false)
  const { login }               = useAuth()
  const navigate                = useNavigate()
  const [params]                = useSearchParams()
  const redirect                = params.get('redirect') || '/'

  const handle = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await loginApi(form)
      login(res.data.token, res.data.user)
      toast.success('Welcome back!')
      navigate(redirect)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white rounded-2xl border shadow-sm p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome back</h1>
        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="mt-1 w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="mt-1 w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account? <Link to="/register" className="text-indigo-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}