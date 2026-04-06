export default function ProductSort({ value, onChange, total }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-gray-500">{total} products found</p>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        <option value="newest">Newest First</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating_desc">Top Rated</option>
      </select>
    </div>
  )
}