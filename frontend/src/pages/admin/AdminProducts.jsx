import { useState, useEffect } from 'react'
import { getProductsApi } from '../../api/product.api'
import { getCategoriesApi } from '../../api/product.api'
import {
  createProductApi, updateProductApi,
  deleteProductApi, deleteProductImageApi, setPrimaryImageApi,
} from '../../api/admin.api'
import Spinner from '../../components/common/Spinner'
import Pagination from '../../components/common/Pagination'
import { formatPrice } from '../../utils/helpers'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '', description: '', price: '', stock: '',
  categoryId: '', variants: '', isActive: true,
}

export default function AdminProducts() {
  const [products,    setProducts]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [total,       setTotal]       = useState(1)
  const [page,        setPage]        = useState(1)
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [search,      setSearch]      = useState('')
  const [showModal,   setShowModal]   = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [images,      setImages]      = useState([])       // new files
  const [previewImgs, setPreviewImgs] = useState([])       // preview URLs
  const [viewProduct, setViewProduct] = useState(null)     // for image management

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await getProductsApi({ page, limit: 12, keyword: search })
      setProducts(res.data.data)
      setTotal(res.data.totalPages)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchProducts() }, [page, search])
  useEffect(() => {
    getCategoriesApi().then(res => setCategories(res.data.categories))
  }, [])

  const openAdd = () => {
    setEditProduct(null)
    setForm(EMPTY_FORM)
    setImages([])
    setPreviewImgs([])
    setShowModal(true)
  }

  const openEdit = (product) => {
    setEditProduct(product)
    setForm({
      name:        product.name,
      description: product.description,
      price:       product.price,
      stock:       product.stock,
      categoryId:  product.category?._id || '',
      variants:    product.variants?.length
                    ? JSON.stringify(product.variants.map(v => ({ name: v.name, value: v.value, price: v.price, stock: v.stock })))
                    : '',
      isActive:    product.isActive,
    })
    setImages([])
    setPreviewImgs([])
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditProduct(null)
    setForm(EMPTY_FORM)
    setImages([])
    setPreviewImgs([])
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)
    setPreviewImgs(files.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)

      // Build FormData for file upload
      const fd = new FormData()
      fd.append('name',        form.name)
      fd.append('description', form.description)
      fd.append('price',       form.price)
      fd.append('stock',       form.stock)
      fd.append('categoryId',  form.categoryId)
      fd.append('isActive',    form.isActive)
      if (form.variants) fd.append('variants', form.variants)
      images.forEach(img => fd.append('images', img))

      if (editProduct) {
        await updateProductApi(editProduct._id, fd)
        toast.success('Product updated!')
      } else {
        await createProductApi(fd)
        toast.success('Product created!')
      }

      closeModal()
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await deleteProductApi(id)
      toast.success('Product deleted')
      fetchProducts()
    } catch { toast.error('Failed to delete product') }
  }

  const handleDeleteImage = async (productId, imageId) => {
    if (!window.confirm('Delete this image?')) return
    try {
      await deleteProductImageApi(productId, imageId)
      toast.success('Image deleted')
      // Refresh view product
      const res = await getProductsApi({ keyword: viewProduct.name, limit: 1 })
      setViewProduct(res.data.data[0] || null)
      fetchProducts()
    } catch { toast.error('Failed to delete image') }
  }

  const handleSetPrimary = async (productId, imageId) => {
    try {
      await setPrimaryImageApi(productId, imageId)
      toast.success('Primary image updated')
      fetchProducts()
    } catch { toast.error('Failed to update primary image') }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-3">
          <input
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={openAdd}
            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? <Spinner /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0]?.url || 'https://placehold.co/40x40?text=No+Img'}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 cursor-pointer"
                        onClick={() => setViewProduct(p)}
                        title="Manage images"
                      />
                      <div>
                        <p className="font-medium text-gray-900 max-w-[160px] truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.numReviews} reviews</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${
                      p.stock === 0 ? 'text-red-500' :
                      p.stock <= 5  ? 'text-orange-500' : 'text-green-600'
                    }`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-xs">
                      <button onClick={() => openEdit(p)}       className="text-indigo-600 hover:underline">Edit</button>
                      <button onClick={() => setViewProduct(p)} className="text-blue-500 hover:underline">Images</button>
                      <button onClick={() => handleDelete(p._id, p.name)} className="text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination page={page} totalPages={total} onPageChange={setPage} />

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-lg">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">Product Name *</label>
                <input
                  required value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="e.g. iPhone 15 Pro"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  required rows={3} value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="Detailed product description..."
                />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Price (₹) *</label>
                  <input
                    required type="number" min="0" step="0.01" value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="999.99"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Stock *</label>
                  <input
                    required type="number" min="0" value={form.stock}
                    onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-gray-700">Category *</label>
                <select
                  required value={form.categoryId}
                  onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="">Select category</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Variants */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Variants <span className="text-gray-400 font-normal">(JSON format, optional)</span>
                </label>
                <textarea
                  rows={3} value={form.variants}
                  onChange={e => setForm(p => ({ ...p, variants: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder='[{"name":"Color","value":"Red","stock":10},{"name":"Color","value":"Blue","stock":15}]'
                />
              </div>

              {/* Images */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {editProduct ? 'Add More Images' : 'Product Images'}
                </label>
                <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
                  <input
                    type="file" multiple accept="image/*"
                    onChange={handleImageChange}
                    className="hidden" id="product-images"
                  />
                  <label htmlFor="product-images" className="cursor-pointer">
                    <div className="text-3xl mb-2">📷</div>
                    <p className="text-sm text-gray-600">Click to select images</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB each (max 5)</p>
                  </label>
                </div>

                {/* Preview */}
                {previewImgs.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {previewImgs.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                        {i === 0 && (
                          <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full px-1">
                            1st
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox" id="isActive"
                  checked={form.isActive}
                  onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-indigo-600"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (visible to customers)
                </label>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={closeModal}
                  className="flex-1 py-2.5 border rounded-xl text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Image Management Modal ── */}
      {viewProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold">Manage Images — {viewProduct.name}</h2>
              <button onClick={() => setViewProduct(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="px-6 py-5">
              {!viewProduct.images?.length ? (
                <p className="text-gray-500 text-sm text-center py-8">No images uploaded yet</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {viewProduct.images.map(img => (
                    <div key={img._id} className="relative group">
                      <img
                        src={img.url} alt=""
                        className={`w-full aspect-square object-cover rounded-lg border-2 ${
                          img.isPrimary ? 'border-indigo-500' : 'border-transparent'
                        }`}
                      />
                      {img.isPrimary && (
                        <span className="absolute top-1 left-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                          Primary
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        {!img.isPrimary && (
                          <button
                            onClick={() => handleSetPrimary(viewProduct._id, img._id)}
                            className="bg-white text-xs text-indigo-600 px-2 py-1 rounded-lg font-medium hover:bg-indigo-50"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteImage(viewProduct._id, img._id)}
                          className="bg-white text-xs text-red-500 px-2 py-1 rounded-lg font-medium hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-4">
                Click product image thumbnail in the table to manage images. Use Edit to add more images.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}