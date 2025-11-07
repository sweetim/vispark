import { useCallback, useEffect, useState, useRef } from "react"
import {
  Navigate,
  useNavigate,
  useParams,
} from "@tanstack/react-router"
import VideoMetadataCard from "@/components/VideoMetadataCard"
import { getAllChannelVideos } from "@/services/channel"
import { useChannelSubscriptionManager, useChannelVideos } from "@/hooks/useChannels"
import { useChannelVisparksWithMetadata } from "@/hooks/useVisparks"
import { useToast } from "@/contexts/ToastContext"

const ChannelPage = () => {
  const navigate = useNavigate()
  const { channelId: rawChannelId } = useParams({ from: '/app/channels/$channelId' })
  const { showToast } = useToast()

  const channelId = (rawChannelId ?? "").trim()

  // Get channel details from the layout context
  const [channelDetails] = useState<any>(null)

  // SWR hooks for data
  const { visparks, isLoading: loadingSavedVideos, error: savedVideosError } = useChannelVisparksWithMetadata(channelId)
  const { isSubscribed, toggleSubscription } = useChannelSubscriptionManager(channelId)
  const { nextPageToken } = useChannelVideos(channelId)

  // State for non-Vispark videos section
  const [nonVisparkVideos, setNonVisparkVideos] = useState<Array<{
    videoId: string
    title: string
    thumbnails: {
      default: { url: string }
      medium?: { url: string }
      high: { url: string }
    }
    publishedAt: string
  }>>([])
  const [loadingNonVisparkVideos, setLoadingNonVisparkVideos] = useState(false)
  const [nonVisparkVideosError, setNonVisparkVideosError] = useState<string | null>(null)
  const [hasMoreVideos, setHasMoreVideos] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // State for expandable sections
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true)
  const [isNonVisparkExpanded, setIsNonVisparkExpanded] = useState(false)

  // Transform visparks to match expected format
  const savedVideos = visparks.map(vispark => ({
    videoId: vispark.videoId,
    title: vispark.metadata.title,
    channelId: vispark.metadata.channelId,
    channelTitle: vispark.metadata.channelTitle,
    thumbnails: vispark.metadata.thumbnails,
    summaries: vispark.summaries,
    created_at: vispark.createdTime,
  }))

  // Filter out videos that already have summaries

  const fetchNonVisparkVideos = useCallback(async (reset: boolean = true) => {
    if (reset) {
      setLoadingNonVisparkVideos(true)
      setNonVisparkVideosError(null)
      setNonVisparkVideos([])
      setHasMoreVideos(true)
    } else {
      setIsLoadingMore(true)
    }

    try {
      let currentPageToken = reset ? undefined : nextPageToken
      let allNewVideos: Array<{
        videoId: string
        title: string
        thumbnails: {
          default: { url: string }
          medium?: { url: string }
          high: { url: string }
        }
        publishedAt: string
      }> = []

      // Keep fetching until we find at least 10 videos without summaries or run out of pages
      while (allNewVideos.length < 10 && currentPageToken !== null) {
        const result = await getAllChannelVideos(channelId, currentPageToken, 50)

        // Filter out videos that already have summaries and transform to match our state structure
        const newVideos = result.videos
          .filter(video => !video.hasSummary)
          .map(video => ({
            videoId: video.videoId,
            title: video.title,
            thumbnails: video.thumbnails,
            publishedAt: video.publishedAt,
          }))

        allNewVideos = [...allNewVideos, ...newVideos]
        currentPageToken = result.nextPageToken

        // If we found enough videos or there's no more pages, break
        if (allNewVideos.length >= 10 || !currentPageToken) {
          break
        }
      }

      // Limit to 10 videos for display
      const videosToAdd = allNewVideos.slice(0, 10)

      if (reset) {
        setNonVisparkVideos(videosToAdd)
      } else {
        setNonVisparkVideos(prev => [...prev, ...videosToAdd])
      }

      // Note: setNextPageToken is not needed as we're using SWR's mutate
      setHasMoreVideos(currentPageToken !== null)
    } catch (error) {
      console.error("Failed to fetch non-Vispark videos:", error)
      setNonVisparkVideosError(
        error instanceof Error ? error.message : "Failed to fetch channel videos",
      )
    } finally {
      if (reset) {
        setLoadingNonVisparkVideos(false)
      } else {
        setIsLoadingMore(false)
      }
    }
  }, [channelId, nextPageToken])

  const handleSubscriptionToggle = async () => {
    try {
      await toggleSubscription()
      showToast(
        `${isSubscribed ? 'Unsubscribed from' : 'Subscribed to'} channel`,
        "success"
      )
    } catch (error) {
      console.error("Failed to toggle subscription:", error)
      showToast(
        `Failed to ${isSubscribed ? 'unsubscribe from' : 'subscribe to'} channel. Please try again.`,
        "error"
      )
    }
  }

  // Fetch non-Vispark videos when section is expanded
  useEffect(() => {
    if (channelId.length > 0 && isNonVisparkExpanded && nonVisparkVideos.length === 0) {
      void fetchNonVisparkVideos(true)
    }
  }, [channelId, isNonVisparkExpanded, fetchNonVisparkVideos, nonVisparkVideos.length])

  // Infinite scroll implementation
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || !hasMoreVideos || isLoadingMore || !isNonVisparkExpanded) {
        return
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

      // Load more when user scrolls to 80% of the content
      if (scrollPercentage > 0.8) {
        void fetchNonVisparkVideos(false)
      }
    }

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [hasMoreVideos, isLoadingMore, isNonVisparkExpanded, fetchNonVisparkVideos])

  const hasSavedVideos = savedVideos.length > 0
  const hasNonVisparkVideos = nonVisparkVideos.length > 0

  if (channelId.length === 0) {
    return (
      <Navigate
        to="/app/channels"
        replace
      />
    )
  }

  return (
    <div ref={scrollContainerRef} className="w-full max-w-3xl h-full space-y-2 overflow-y-auto pb-20">
      {/* Channel Header */}
      {channelDetails && (
        <div className="glass-effect border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <img
                src={channelDetails.channelThumbnailUrl}
                alt={channelDetails.channelTitle}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h1 className="text-xl font-semibold text-white">
                  {channelDetails.channelTitle}
                </h1>
                <p className="text-sm text-gray-400">
                  {channelDetails.videoCount?.toLocaleString() || 0} videos
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSubscriptionToggle}
              disabled={false} // Loading state managed by SWR hook
              className={`p-2 rounded-lg transition-colors ${
                isSubscribed
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
              title={isSubscribed ? "Unsubscribe" : "Subscribe"}
            >
              {false ? ( // Loading state managed by SWR hook
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : isSubscribed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <title>Unsubscribe</title>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <title>Subscribe</title>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Libraries Section */}
      <div className="space-y-3">
        <div
          className="sticky top-0 z-10 flex items-center justify-between cursor-pointer p-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl transition-all duration-200 hover:bg-gray-800/50"
          onClick={() => setIsLibraryExpanded(!isLibraryExpanded)}
        >
          <div className="flex items-center space-x-3">
            <div className={`transform transition-transform duration-200 ${isLibraryExpanded ? 'rotate-90' : ''}`}>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Libraries</h2>
          </div>
          {hasSavedVideos && (
            <div className="px-3 py-1 bg-indigo-600 rounded-lg text-white text-sm font-medium">
              {savedVideos.length}
            </div>
          )}
        </div>

        {isLibraryExpanded && (
          <div className="space-y-4 pl-4">

        {/* Loading State for Saved Videos */}
        {loadingSavedVideos && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-500/30 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-400 font-medium">
              Loading your video library...
            </p>
          </div>
        )}

        {/* Error State for Saved Videos */}
        {savedVideosError && (
          <div className="relative overflow-hidden bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl p-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-red-500 to-pink-500"></div>
            <div className="flex items-start space-x-3">
              <div className="shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-400 text-sm">!</span>
              </div>
              <div>
                <h3 className="text-red-400 font-medium mb-1">
                  Error loading videos
                </h3>
                <p className="text-red-300/80 text-sm">{savedVideosError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Saved Videos Grid */}
        {!loadingSavedVideos && !savedVideosError && hasSavedVideos && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedVideos.map((video) => (
              <div
                key={video.videoId}
                className="group relative transform transition-all duration-300 hover:scale-105"
              >
                <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                  <VideoMetadataCard
                    metadata={{
                      videoId: video.videoId,
                      title: video.title,
                      channelId: video.channelId,
                      channelTitle: video.channelTitle,
                      thumbnails: {
                        default: video.thumbnails.default,
                        medium:
                          video.thumbnails.medium || video.thumbnails.default,
                        high: video.thumbnails.high,
                      },
                    }}
                    onClick={() =>
                      navigate({ to: `/app/videos/${video.videoId}` })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State for Saved Videos */}
        {!loadingSavedVideos && !savedVideosError && !hasSavedVideos && (
          <div className="relative overflow-hidden bg-gray-800/30 backdrop-blur-sm border border-dashed border-gray-700 rounded-2xl p-12 text-center">
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-purple-500/5"></div>
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-700/50 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Video Library Icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No videos in your library yet
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {channelDetails
                  ? `Start building your collection by adding videos from ${channelDetails.channelTitle}.`
                  : "Search for channels and start adding videos to create your personalized library."}
              </p>
            </div>
          </div>
        )}
          </div>
        )}
      </div>

      {/* Non-Vispark Videos Section */}
      <div className="space-y-3">
        <div
          className="sticky top-0 z-10 flex items-center justify-between cursor-pointer p-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl transition-all duration-200 hover:bg-gray-800/50"
          onClick={() => setIsNonVisparkExpanded(!isNonVisparkExpanded)}
        >
          <div className="flex items-center space-x-3">
            <div className={`transform transition-transform duration-200 ${isNonVisparkExpanded ? 'rotate-90' : ''}`}>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Discover Videos</h2>
          </div>
        </div>

        {isNonVisparkExpanded && (
          <div className="space-y-4 pl-4">
            {/* Loading State for Non-Vispark Videos */}
            {loadingNonVisparkVideos && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-purple-500 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
                </div>
                <p className="mt-4 text-gray-400 font-medium">
                  Loading channel videos...
                </p>
              </div>
            )}

            {/* Error State for Non-Vispark Videos */}
            {nonVisparkVideosError && (
              <div className="relative overflow-hidden bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-red-500 to-pink-500"></div>
                <div className="flex items-start space-x-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 text-sm">!</span>
                  </div>
                  <div>
                    <h3 className="text-red-400 font-medium mb-1">
                      Error loading videos
                    </h3>
                    <p className="text-red-300/80 text-sm">{nonVisparkVideosError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Non-Vispark Videos Grid with Virtual Scrolling */}
            {!loadingNonVisparkVideos && !nonVisparkVideosError && hasNonVisparkVideos && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nonVisparkVideos.map((video) => (
                    <div
                      key={video.videoId}
                      className="group relative transform transition-all duration-300 hover:scale-105"
                    >
                      <div className="absolute -inset-1 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
                      <div className="relative bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                        <VideoMetadataCard
                          metadata={{
                            videoId: video.videoId,
                            title: video.title,
                            channelId: channelId,
                            channelTitle: channelDetails?.channelTitle || '',
                            thumbnails: {
                              default: video.thumbnails.default,
                              medium:
                                video.thumbnails.medium || video.thumbnails.default,
                              high: video.thumbnails.high,
                            },
                          }}
                          onClick={() =>
                            navigate({ to: `/app/videos/${video.videoId}` })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Loading More Indicator */}
                {isLoadingMore && (
                  <div className="flex justify-center pt-4">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {!hasMoreVideos && nonVisparkVideos.length > 0 && (
                  <div className="text-center py-4 text-gray-400">
                    <p>No more videos to load</p>
                  </div>
                )}
              </div>
            )}

            {/* Empty State for Non-Vispark Videos */}
            {!loadingNonVisparkVideos && !nonVisparkVideosError && !hasNonVisparkVideos && (
              <div className="relative overflow-hidden bg-gray-800/30 backdrop-blur-sm border border-dashed border-gray-700 rounded-2xl p-12 text-center">
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-pink-500/5"></div>
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-700/50 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <title>Discover Videos Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No new videos to discover
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    All videos from {channelDetails?.channelTitle || 'this channel'} have been summarized. Check back later for new content!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChannelPage
