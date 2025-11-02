import { useCallback, useEffect, useState } from "react"
import {
  Navigate,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router"
import VideoMetadataCard from "@/components/VideoMetadataCard"
import {
  fetchYouTubeVideoDetails,
  listVisparksByChannelId,
} from "@/services/vispark"
import { isChannelSubscribed, subscribeToChannel, unsubscribeFromChannel } from "@/services/channel"
import { subscribeToYouTubePush, unsubscribeFromPushNotifications } from "@/services/youtubePush"
import { useToast } from "@/contexts/ToastContext"
import type { ChannelOutletContext } from "./Layout"

const ChannelPage = () => {
  const navigate = useNavigate()
  const { channelId: rawChannelId } = useParams<{ channelId: string }>()
  const { channelDetails, refreshChannelData } =
    useOutletContext<ChannelOutletContext>()
  const { showToast } = useToast()

  const channelId = (rawChannelId ?? "").trim()
  const [savedVideos, setSavedVideos] = useState<
    Array<{
      videoId: string
      title: string
      channelId: string
      channelTitle: string
      thumbnails: {
        default: { url: string }
        medium?: { url: string }
        high: { url: string }
      }
      summaries?: string[]
      created_at?: string
    }>
  >([])
  const [loadingSavedVideos, setLoadingSavedVideos] = useState(false)
  const [savedVideosError, setSavedVideosError] = useState<string | null>(null)
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false)
  const [loadingSubscription, setLoadingSubscription] = useState<boolean>(false)

  useEffect(() => {
    if (channelId.length > 0) {
      void refreshChannelData(channelId)
    }
  }, [channelId, refreshChannelData])

  // Check subscription status when channel ID changes
  useEffect(() => {
    if (channelId.length > 0) {
      const checkSubscriptionStatus = async () => {
        try {
          const subscribed = await isChannelSubscribed(channelId)
          setIsSubscribed(subscribed)
        } catch (error) {
          console.error("Failed to check subscription status:", error)
          setIsSubscribed(false)
        }
      }

      checkSubscriptionStatus()
    }
  }, [channelId])

  const fetchSavedVideos = useCallback(async () => {
    setLoadingSavedVideos(true)
    setSavedVideosError(null)

    try {
      const visparks = await listVisparksByChannelId(channelId)

      // Fetch video metadata for each saved video
      const videoPromises = visparks.map(async (vispark) => {
        try {
          const metadata = await fetchYouTubeVideoDetails(vispark.video_id)
          return {
            ...metadata,
            summaries: vispark.summaries,
            created_at: vispark.created_at,
          }
        } catch (error) {
          console.error(
            `Failed to fetch metadata for video ${vispark.video_id}:`,
            error,
          )
          return null
        }
      })

      const videos = (await Promise.all(videoPromises)).filter(
        (video): video is NonNullable<typeof video> => Boolean(video),
      )
      setSavedVideos(videos)
    } catch (error) {
      console.error("Failed to fetch saved videos:", error)
      setSavedVideosError(
        error instanceof Error ? error.message : "Failed to fetch saved videos",
      )
    } finally {
      setLoadingSavedVideos(false)
    }
  }, [channelId])

  const handleSubscriptionToggle = async () => {
    if (!channelId) return

    setLoadingSubscription(true)
    try {
      if (isSubscribed) {
        await unsubscribeFromChannel(channelId)
        try {
          await unsubscribeFromPushNotifications(channelId)
        } catch (pushError) {
          console.warn("Failed to unsubscribe from push notifications:", pushError)
          // Continue with channel unsubscription even if push unsubscription fails
        }
        setIsSubscribed(false)
        showToast(`Unsubscribed from ${channelDetails?.channelTitle || 'channel'}`, "success")
        console.log(`Unsubscribed from channel ${channelId}`)
      } else {
        await subscribeToChannel(channelId)
        try {
          await subscribeToYouTubePush(channelId)
        } catch (pushError) {
          console.warn("Failed to subscribe to push notifications:", pushError)
          // Continue with channel subscription even if push subscription fails
          // Show a user-friendly message about push notifications
          showToast(
            `Subscribed to ${channelDetails?.channelTitle || 'channel'}, but push notifications may not work. Please contact support if this issue persists.`,
            "warning",
            8000
          )
        }
        if (!console.warn.toString().includes("Failed to subscribe to push notifications")) {
          showToast(`Subscribed to ${channelDetails?.channelTitle || 'channel'}`, "success")
        }
        setIsSubscribed(true)
        console.log(`Subscribed to channel ${channelId}`)
      }
    } catch (error) {
      console.error("Failed to toggle subscription:", error)
      showToast(
        `Failed to ${isSubscribed ? 'unsubscribe from' : 'subscribe to'} channel. Please try again.`,
        "error"
      )
    } finally {
      setLoadingSubscription(false)
    }
  }

  useEffect(() => {
    if (channelId.length > 0) {
      void fetchSavedVideos()
    }
  }, [channelId, fetchSavedVideos])

  const hasSavedVideos = savedVideos.length > 0

  if (channelId.length === 0) {
    return (
      <Navigate
        to="/app/channel/search"
        replace
      />
    )
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
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
              disabled={loadingSubscription}
              className={`p-2 rounded-lg transition-colors ${
                isSubscribed
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
              title={isSubscribed ? "Unsubscribe" : "Subscribe"}
            >
              {loadingSubscription ? (
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

      {/* Saved Videos List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Library</h2>
          </div>
          {hasSavedVideos && (
            <div className="px-4 py-2 bg-linear-to-r from-indigo-500 to-purple-500 rounded-lg text-white font-medium shadow-lg">
              {savedVideos.length} videos
            </div>
          )}
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      navigate(`/app/vispark/search/${video.videoId}`)
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
    </div>
  )
}

export default ChannelPage
