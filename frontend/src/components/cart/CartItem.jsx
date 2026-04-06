import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../utils/helpers'

export default function CartItem({ item }) {
  const { updateItem, removeItem } = useCart()
  const image = item.product?.images?.[0]?.url || 'https://placehold.co/80x80'

  return (
    <div className="flex gap-3 py-3 border-b last:border-0">
      <img src={image} alt={item.product?.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name}</p>
        {item.variantInfo?.value && (
          <p className="text-xs text-gray-500">{item.variantInfo.name}: {item.variantInfo.value}</p>
        )}
        <p className="text-sm font-semibold text-indigo-600 mt-1">{formatPrice(item.price)}</p>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => item.quantity > 1 ? updateItem(item._id, item.quantity - 1) : removeItem(item._id)}
            className="w-6 h-6 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-100"
          >
            −
          </button>
          <span className="text-sm w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => updateItem(item._id, item.quantity + 1)}
            className="w-6 h-6 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-100"
          >
            +
          </button>
          <button
            onClick={() => removeItem(item._id)}
            className="ml-auto text-xs text-red-400 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}