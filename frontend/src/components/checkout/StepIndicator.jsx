export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              i < current  ? 'bg-indigo-600 text-white' :
              i === current ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
              'bg-gray-200 text-gray-500'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className="text-xs mt-1 text-gray-500">{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 w-16 mx-2 mb-4 ${i < current ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}