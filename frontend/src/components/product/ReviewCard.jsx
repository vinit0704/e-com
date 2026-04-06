import StarRating from '../common/StarRating'
import { formatDate } from '../../utils/helpers'

export default function ReviewCard({ review }) {
  return (
    <div className="border-b pb-4 last:border-0">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-sm">{review.user?.name || 'Anonymous'}</p>
          <StarRating rating={review.rating} size="sm" />
        </div>
        <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
      </div>
      <p className="font-medium text-sm mt-2">{review.title}</p>
      <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
    </div>
  )
}