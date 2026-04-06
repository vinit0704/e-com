export default function StarRating({ rating, max = 5, size = 'sm', onChange }) {
  const sizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' }
  return (
    <div className={`flex gap-0.5 ${sizes[size]}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          onClick={() => onChange?.(i + 1)}
          className={`${onChange ? 'cursor-pointer' : ''} ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}