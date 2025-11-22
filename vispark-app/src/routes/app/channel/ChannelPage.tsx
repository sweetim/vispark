import {
  Navigate,
  useNavigate,
  useParams,
} from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useChannelSubscriptionManager, useYouTubeChannelDetails } from "@/hooks/useChannels"
import { useToast } from "@/contexts/ToastContext"
import { useInfiniteVisparksByChannel } from "@/hooks/useVisparks"
import { useInfiniteYouTubeChannelVideos } from "@/hooks/useYouTubeChannelVideos"
import { VideoMetadataCard, Expander } from "@/components"
import { useVideoStore } from "@/stores/videoStore"
import { useState, useRef, useEffect } from "react"
import {
  VideoCameraIcon,
  UsersIcon,
  BellIcon,
  BellSlashIcon
} from "@phosphor-icons/react"
import { ChannelHeader, VirtualizedGrid } from "@/components"

type VirtualizedItem = {
  id?: string
  videoId: string
  title: string
  channelTitle: string
  thumbnail: string
  createdTime: string | undefined
  isNewFromCallback?: boolean
}

const ChannelPage = () => {
  const { t } = useTranslation()
  const { channelId: rawChannelId } = useParams({ from: '/app/channels/$channelId' })
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { processingVideoId, status, videoMetadata } = useVideoStore()

  const channelId = (rawChannelId ?? "").trim()

  // State to track which expander is currently expanded
  const [expandedSection, setExpandedSection] = useState<'libraries' | 'discover' | null>('libraries')

  // Ref for scrolling
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null)

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

  // Libraries Data
  const {
    visparks,
    isLoading: loadingVisparks,
    isLoadingMore: loadingMoreVisparks,
    isReachingEnd: isReachingEndVisparks,
    error: visparksError,
    size: visparksSize,
    setSize: setVisparksSize,
    mutate: mutateVisparks
  } = useInfiniteVisparksByChannel(channelId)

  // Discover Data
  const {
    videos,
    isLoading: loadingVideos,
    isLoadingMore: loadingMoreVideos,
    isReachingEnd: isReachingEndVideos,
    error: videosError,
    size: videosSize,
    setSize: setVideosSize
  } = useInfiniteYouTubeChannelVideos(channelId)

  const handleItemClick = (item: VirtualizedItem) => {
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

  // Listen for video processing completion and revalidate visparks data
  useEffect(() => {
    if (status === "complete" && processingVideoId) {
      // Check if processed video belongs to this channel
      // First check if video metadata has matching channel ID
      const processedVideoInChannel = videoMetadata?.channelId === channelId ||
        videos.some(v => v.videoId === processingVideoId)

      if (processedVideoInChannel) {
        // Revalidate visparks data to show new video
        mutateVisparks()
      }
    }
  }, [status, processingVideoId, channelId, videos, mutateVisparks, videoMetadata])

  // Revalidate visparks data when component mounts or gains focus
  useEffect(() => {
    const handleFocus = () => {
      mutateVisparks()
    }

    // Add focus event listener to refresh data when user returns to page
    window.addEventListener('focus', handleFocus)

    // Also revalidate on mount
    mutateVisparks()

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [mutateVisparks])

  if (channelId.length === 0) {
    return (
      <Navigate
        to="/app/channels"
        replace
      />
    )
  }

  return (
    <div ref={setScrollElement} className="w-full max-w-3xl h-full space-y-2 overflow-y-auto">
      <ChannelHeader
        channelName={channelName}
        channelThumbnail={channelThumbnail}
        videoCount={videoCount}
        subscriberCount={subscriberCount}
        isSubscribed={isSubscribed}
        onSubscriptionToggle={handleSubscriptionToggle}
        isLoading={isLoading}
        error={youtubeDetailsError?.message}
      />

      {/* Libraries and Discover Expanders */}
      <div className="space-y-2">
        {/* Libraries Expander */}
        <Expander
          title="Libraries"
          isExpanded={expandedSection === 'libraries'}
          onToggle={() => setExpandedSection(expandedSection === 'libraries' ? null : 'libraries')}
          isSummarizing={Boolean(processingVideoId && videos.some(v => v.videoId === processingVideoId) && (status === "gathering" || status === "summarizing"))}
        >
          <VirtualizedGrid
            items={[
              ...visparks.map(vispark => ({
                id: vispark.id,
                videoId: vispark.video_id || '',
                title: vispark.video_title,
                channelTitle: vispark.video_channel_title,
                thumbnail: vispark.video_thumbnails,
                createdTime: vispark.video_published_at,
                isNewFromCallback: vispark.is_new_from_callback
              })),
              // Add currently processing video from Discover section if it belongs to this channel
              ...(processingVideoId && videos.some(v => v.videoId === processingVideoId) ? [{
                id: `processing-${processingVideoId}`,
                videoId: processingVideoId,
                title: videos.find(v => v.videoId === processingVideoId)?.title || '',
                channelTitle: youtubeChannelDetails?.channelName || '',
                thumbnail: videos.find(v => v.videoId === processingVideoId)?.thumbnails || '',
                createdTime: videos.find(v => v.videoId === processingVideoId)?.publishedAt,
                isNewFromCallback: false
              }] : [])
            ]}
            isLoading={loadingVisparks}
            isLoadingMore={loadingMoreVisparks || false}
            loadMoreRows={() => setVisparksSize(visparksSize + 1) as any}
            rowCount={isReachingEndVisparks ? visparks.length : visparks.length + 1}
            scrollElement={scrollElement}
            emptyMessage="No vispark summaries found for this channel."
            errorMessage="Error loading libraries"
            error={visparksError}
            onItemClick={handleItemClick}
            processingVideoId={processingVideoId}
            processingStatus={status}
          />
        </Expander>

        {/* Discover Expander */}
        <Expander
          title="Discover"
          isExpanded={expandedSection === 'discover'}
          onToggle={() => setExpandedSection(expandedSection === 'discover' ? null : 'discover')}
          isSummarizing={Boolean(processingVideoId && videos.some(v => v.videoId === processingVideoId) && (status === "gathering" || status === "summarizing"))}
        >
          <VirtualizedGrid
            items={videos.filter(video => video.videoId !== processingVideoId).map(video => ({
              videoId: video.videoId,
              title: video.title,
              channelTitle: youtubeChannelDetails?.channelName || '',
              thumbnail: video.thumbnails,
              createdTime: video.publishedAt
            }))}
            isLoading={loadingVideos}
            isLoadingMore={loadingMoreVideos || false}
            loadMoreRows={() => setVideosSize(videosSize + 1) as any}
            rowCount={isReachingEndVideos ? videos.filter(video => video.videoId !== processingVideoId).length : videos.filter(video => video.videoId !== processingVideoId).length + 1}
            scrollElement={scrollElement}
            emptyMessage="No videos found for this channel."
            errorMessage="Error loading videos"
            error={videosError}
            onItemClick={handleItemClick}
            processingVideoId={processingVideoId}
            processingStatus={status}
          />
        </Expander>
      </div>
    </div>
  )
}

export default ChannelPage
