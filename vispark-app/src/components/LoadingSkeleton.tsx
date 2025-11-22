const LoadingSkeleton = () => (
  <div className="space-y-3 animate-fadeIn">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="p-4 rounded-xl glass-effect"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full skeleton"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 rounded skeleton w-3/4"></div>
            <div className="h-3 rounded skeleton w-1/2"></div>
          </div>
          <div className="w-10 h-10 rounded-full skeleton"></div>
        </div>
      </div>
    ))}
  </div>
)

export default LoadingSkeleton
