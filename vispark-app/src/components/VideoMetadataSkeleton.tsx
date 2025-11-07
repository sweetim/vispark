const VideoMetadataSkeleton = () => (
  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-lg">
    <div className="absolute inset-0 bg-gray-700 animate-pulse" />
    <div className="absolute bottom-0 left-0 right-0 p-1">
      <div className="inline-block rounded-md bg-black/40 px-3 py-2 backdrop-blur">
        <div className="h-3 w-48 bg-gray-500/60 rounded" />
        <div className="mt-2 h-2 w-32 bg-gray-500/40 rounded" />
      </div>
    </div>
  </div>
)

export default VideoMetadataSkeleton
