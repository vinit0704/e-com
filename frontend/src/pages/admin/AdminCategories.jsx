import { useState, useEffect } from 'react'
import { getCategoriesApi } from '../../api/product.api'
import { createCategoryApi, updateCategoryApi, deleteCategoryApi } from '../../api/admin.api'
import Spinner from '../../components/common/Spinner'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const EMPTY = { name: '', parentId: '' }

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [showModal,  setShowModal]  = useState(false)
  const [editCat,    setEditCat]    = useState(null)
  const [form,       setForm]       = useState(EMPTY)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await getCategoriesApi()
      setCategories(res.data.categories)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const openAdd = () => { setEditCat(null); setForm(EMPTY); setShowModal(true) }
  const openEdit = (cat) => {
    setEditCat(cat)
    setForm({ name: cat.name, parentId: cat.parent?._id || cat.parent || '' })
    setShowModal(true)
  }
  const close = () => { setShowModal(false); setEditCat(null); setForm(EMPTY) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const data = { name: form.name, parentId: form.parentId || null }
      if (editCat) {
        await updateCategoryApi(editCat._id, data)
        toast.success('Category updated!')
      } else {
        await createCategoryApi(data)
        toast.success('Category created!')
      }
      close(); fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await deleteCategoryApi(id)
      toast.success('Category deleted')
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  // Flatten for table display
  const flat = categories.reduce((acc, cat) => {
    acc.push({ ...cat, level: 0 })
    if (cat.children?.length) {
      cat.children.forEach(child => acc.push({ ...child, level: 1 }))
    }
    return acc
  }, [])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={openAdd}
          className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? <Spinner /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flat.map(cat => (
                <tr key={cat._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {cat.level === 1 && <span className="text-gray-400 mr-2">└</span>}
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      cat.level === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {cat.level === 0 ? 'Parent' : 'Sub'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{cat._count?.products || cat.products?.length || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-xs">
                      <button onClick={() => openEdit(cat)} className="text-indigo-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(cat._id, cat.name)} className="text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold">{editCat ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={close} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Category Name *</label>
                <input
                  required value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="e.g. Electronics"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Parent Category <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={form.parentId}
                  onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="">None (top-level)</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={close} className="flex-1 py-2.5 border rounded-xl text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? 'Saving...' : editCat ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}