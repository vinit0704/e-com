import { useState } from 'react'

export default function ProductImages({ images }) {
  const [active, setActive] = useState(0)
  const list = images?.length ? images : [{ url: 'https://placehold.co/600x600?text=No+Image' }]

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border">
        <img
          src={list[active]?.url}
          alt="Product"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                active === i ? 'border-indigo-500' : 'border-transparent'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}