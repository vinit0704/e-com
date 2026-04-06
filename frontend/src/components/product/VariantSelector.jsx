export default function VariantSelector({ variants, selected, onSelect }) {
  if (!variants?.length) return null

  // Group variants by name
  const groups = variants.reduce((acc, v) => {
    if (!acc[v.name]) acc[v.name] = []
    acc[v.name].push(v)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([name, options]) => (
        <div key={name}>
          <h4 className="text-sm font-medium text-gray-700 mb-2">{name}</h4>
          <div className="flex flex-wrap gap-2">
            {options.map(v => (
              <button
                key={v._id}
                onClick={() => onSelect(v)}
                className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  selected?._id === v._id
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-gray-300 hover:border-indigo-300'
                } ${v.stock === 0 ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                disabled={v.stock === 0}
              >
                {v.value}
                {v.price && v.price !== v.price && (
                  <span className="ml-1 text-xs text-gray-500">+₹{v.price}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}