import {
  Navigate,
  useNavigate,
  useParams,
} from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useChannelSubscriptionManager, useYouTubeChannelDetails } from "@/hooks/useChannels"
import { useToast } from "@/contexts/ToastContext"
import { useVisparksByChannel } from "@/hooks/useVisparks"
import { useYouTubeChannelVideos } from "@/hooks/useYouTubeChannelVideos"
import Expander from "@/components/Expander"
import VideoMetadataCard from "@/components/VideoMetadataCard"
import { useState } from "react"
import {
  VideoCameraIcon,
  UsersIcon,
  BellIcon,
  BellSlashIcon
} from "@phosphor-icons/react"

const ChannelPage = () => {
  const { t } = useTranslation()
  const { channelId: rawChannelId } = useParams({ from: '/app/channels/$channelId' })
  const { showToast } = useToast()
  const navigate = useNavigate()

  const channelId = (rawChannelId ?? "").trim()

  // State to track which expander is currently expanded
  const [expandedSection, setExpandedSection] = useState<'libraries' | 'discover' | null>('libraries')

  // Get YouTube channel details directly from YouTube API
  const { youtubeChannelDetails,
    isLoading: loadingYouTubeDetails, error: youtubeDetailsError } = useYouTubeChannelDetails(channelId)

  const isLoading = loadingYouTubeDetails

  // Extract display values from YouTube API
  const channelName = youtubeChannelDetails?.channelName || ""
  const channelThumbnail = youtubeChannelDetails?.thumbnails || ""
  const videoCount = youtubeChannelDetails?.videoCount || 0
  const subscriberCount = youtubeChannelDetails?.subscriberCount

  // Get subscription manager with channel details
  const { isSubscribed, toggleSubscription } = useChannelSubscriptionManager(
    channelId,
    channelName,
    channelThumbnail
  )

  const handleSubscriptionToggle = async () => {
    try {
      await toggleSubscription()
      showToast(
        `${isSubscribed ? t('channels.unsubscribedFromChannel') : t('channels.subscribedToChannel')}`,
        "success"
      )
    } catch (error) {
      console.error("Failed to toggle subscription:", error)
      showToast(
        `${isSubscribed ? t('channels.failedToUnsubscribe') : t('channels.failedToSubscribe')}`,
        "error"
      )
    }
  }

  // Unified Content Component for both Libraries and Discover
  const ContentGrid = ({
    data,
    emptyMessage,
    errorMessage
  }: {
    data: {
      items: Array<{
        id?: string
        videoId: string
        title: string
        channelTitle: string
        thumbnail: string
        createdTime: string | undefined
        isNewFromCallback?: boolean
      }>
      isLoading: boolean
      error: any
    }
    emptyMessage: string
    errorMessage: string
  }) => {
    if (data.isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )
    }

    if (data.error) {
      return (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{errorMessage}: {data.error.message}</p>
        </div>
      )
    }

    if (data.items.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">{emptyMessage}</p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {data.items.map((item) => (
            <div
              key={item.id || item.videoId}
              className="group relative transform transition-all duration-300 hover:scale-105"
            >
              <div className="absolute -inset-1 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                <VideoMetadataCard
                  metadata={{
                    videoId: item.videoId,
                    title: item.title,
                    channelId: channelId,
                    channelTitle: item.channelTitle,
                    thumbnails: item.thumbnail,
                  }}
                  createdTime={item.createdTime}
                  isNewFromCallback={item.isNewFromCallback || false}
                  onClick={() =>
                    navigate({
                      to: `/app/videos/${item.videoId}`,
                      search: {
                        title: item.title,
                        channelTitle: item.channelTitle,
                        thumbnail: item.thumbnail,
                        createdTime: item.createdTime,
                        channelId: channelId
                      }
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

    if (channelId.length === 0) {
    return (
      <Navigate
        to="/app/channels"
        replace
      />
    )
  }

  return (
    <div className="w-full max-w-3xl h-full space-y-2 overflow-y-auto">
      {/* Channel Header */}
      {isLoading ? (
        <div className="glass-effect border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse"></div>
              <div>
                <div className="h-5 w-48 bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      ) : channelName ? (
        <div className="glass-effect border-b border-gray-800 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={channelThumbnail}
                alt={channelName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="space-y-2">
                <h1 className="text-xl font-semibold text-white">
                  {channelName}
                </h1>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-300">
                    <VideoCameraIcon className="w-4 h-4" />
                    <span>{videoCount.toLocaleString()}</span>
                  </div>
                  {subscriberCount && (
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-purple-500/10 text-purple-300">
                      <UsersIcon className="w-4 h-4" />
                      <span>{subscriberCount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSubscriptionToggle}
              disabled={false}
              className={`p-2 rounded-lg transition-colors ${
                isSubscribed
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
              title={isSubscribed ? t("channels.unsubscribe") : t("channels.subscribe")}
            >
              {isSubscribed ? (
                <BellSlashIcon className="w-5 h-5" />
              ) : (
                <BellIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      ) : youtubeDetailsError ? (
        <div className="glass-effect border-b border-gray-800 px-6 py-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-red-400 font-medium mb-2">
              {t("channels.errorLoadingChannel")}
            </h3>
            <p className="text-red-300/80 text-sm">{youtubeDetailsError.message}</p>
          </div>
        </div>
      ) : null}

      {/* Libraries and Discover Expanders */}
      <div className="space-y-2">
        {/* Libraries Expander */}
        <Expander
          title="Libraries"
          isExpanded={expandedSection === 'libraries'}
          onToggle={() => setExpandedSection(expandedSection === 'libraries' ? null : 'libraries')}
        >
          <ContentGrid
            data={{
              items: useVisparksByChannel(channelId).visparks.map(vispark => ({
                id: vispark.id,
                videoId: vispark.video_id,
                title: vispark.video_title,
                channelTitle: vispark.video_channel_title,
                thumbnail: vispark.video_thumbnails,
                createdTime: vispark.video_published_at,
                isNewFromCallback: vispark.is_new_from_callback
              })),
              isLoading: useVisparksByChannel(channelId).isLoading,
              error: useVisparksByChannel(channelId).error
            }}
            emptyMessage="No vispark summaries found for this channel."
            errorMessage="Error loading libraries"
          />
        </Expander>

        {/* Discover Expander */}
        <Expander
          title="Discover"
          isExpanded={expandedSection === 'discover'}
          onToggle={() => setExpandedSection(expandedSection === 'discover' ? null : 'discover')}
        >
          <ContentGrid
            data={{
              items: useYouTubeChannelVideos(channelId).videos.map(video => ({
                videoId: video.videoId,
                title: video.title,
                channelTitle: youtubeChannelDetails?.channelName || '',
                thumbnail: video.thumbnails,
                createdTime: video.publishedAt
              })),
              isLoading: useYouTubeChannelVideos(channelId).isLoading,
              error: useYouTubeChannelVideos(channelId).error
            }}
            emptyMessage="No videos with vispark summaries found for this channel."
            errorMessage="Error loading videos"
          />
        </Expander>
      </div>
    </div>
  )
}

export default ChannelPage
