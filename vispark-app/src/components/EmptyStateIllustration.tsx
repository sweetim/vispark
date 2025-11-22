type EmptyStateIllustrationProps = {
  type: "search" | "no-results"
}

const EmptyStateIllustration = ({
  type,
}: EmptyStateIllustrationProps) => {
  if (type === "search") {
    return (
      <div className="flex flex-col items-center space-y-4 animate-float">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Search magnifying glass</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4 animate-float">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-linear-to-br from-gray-600/20 to-gray-700/20 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>No results face</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default EmptyStateIllustration
