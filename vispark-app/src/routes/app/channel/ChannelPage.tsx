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
import VideoMetadataCard from "@/components/VideoMetadataCard"
import { useVideoStore } from "@/stores/videoStore"
import { useState, useRef, useEffect } from "react"
import {
  VideoCameraIcon,
  UsersIcon,
  BellIcon,
  BellSlashIcon,
  CaretDownIcon
} from "@phosphor-icons/react"
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List,
  WindowScroller,
} from "react-virtualized"
import "react-virtualized/styles.css"

type VirtualizedItem = {
  id?: string
  videoId: string
  title: string
  channelTitle: string
  thumbnail: string
  createdTime: string | undefined
  isNewFromCallback?: boolean
}

type VirtualizedContentGridProps = {
  items: VirtualizedItem[]
  isLoading: boolean
  isLoadingMore: boolean
  loadMoreRows: () => Promise<void>
  rowCount: number
  scrollElement: HTMLElement | null
  emptyMessage: string
  errorMessage: string
  error: any
  onItemClick: (item: VirtualizedItem) => void
  processingVideoId: string | null
  processingStatus: "idle" | "gathering" | "summarizing" | "complete" | "error"
}

const VirtualizedContentGrid = ({
  items,
  isLoading,
  isLoadingMore,
  loadMoreRows,
  rowCount,
  scrollElement,
  emptyMessage,
  errorMessage,
  error,
  onItemClick,
  processingVideoId,
  processingStatus
}: VirtualizedContentGridProps) => {
  const cache = useRef(new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 220, // Increased to account for aspect-video ratio and padding
    minHeight: 180, // Increased minimum height
    keyMapper: (index) => index // Add key mapper for proper cache invalidation
  }))

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-400">{errorMessage}: {error.message}</p>
      </div>
    )
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-[200px]">
      <WindowScroller scrollElement={scrollElement || undefined}>
        {({ height, isScrolling, onChildScroll, scrollTop }) => (
          <AutoSizer disableHeight>
            {({ width }) => {
              const columnCount = width > 1024 ? 3 : width > 768 ? 2 : 1
              const columnWidth = width / columnCount
              const rowCountCalculated = Math.ceil(rowCount / columnCount)

              const rowRenderer = ({ index, key, parent, style }: { index: number, key: string, parent: any, style: React.CSSProperties }) => {
                const startIndex = index * columnCount
                const rowItems = items.slice(startIndex, startIndex + columnCount)

                return (
                  <CellMeasurer
                    cache={cache.current}
                    columnIndex={0}
                    rowIndex={index}
                    parent={parent}
                    key={key}
                  >
                    {({ measure, registerChild }) => (
                      <div
                        style={{...style}}
                        ref={(element) => {
                          if (element) {
                            registerChild(element)
                            // Force remeasurement after content is rendered
                            setTimeout(() => {
                              cache.current.clear(index, 0)
                              measure()
                            }, 0)
                          }
                        }}
                        className="flex gap-2 p-1"
                      >
                        {rowItems.map((item) => (
                          <div
                            key={item.id || item.videoId}
                            style={{ width: columnWidth - 8 }} // Account for gap
                            className="flex-shrink-0"
                          >
                            <div className="group relative transform transition-all duration-300 hover:scale-105">
                              <div className="absolute -inset-1 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
                              <div className="relative bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                                <VideoMetadataCard
                                  metadata={{
                                    videoId: item.videoId,
                                    title: item.title,
                                    channelId: "", // Not needed for display
                                    channelTitle: item.channelTitle,
                                    thumbnails: item.thumbnail,
                                  }}
                                  createdTime={item.createdTime}
                                  isNewFromCallback={item.isNewFromCallback || false}
                                  isSummarizing={processingVideoId === item.videoId && (processingStatus === "gathering" || processingStatus === "summarizing")}
                                  onClick={() => onItemClick(item)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CellMeasurer>
                )
              }

              return (
                <InfiniteLoader
                  isRowLoaded={({ index }) => {
                    // Check if all items in this row are loaded
                    const startIndex = index * columnCount
                    // If the last item in the row is within the loaded items range
                    return startIndex < items.length
                  }}
                  loadMoreRows={async () => {
                    await loadMoreRows()
                    // Clear cache after loading more rows to recalculate heights
                    cache.current.clearAll()
                  }}
                  rowCount={rowCountCalculated}
                  threshold={5}
                >
                  {({ onRowsRendered, registerChild }) => (
                    <List
                      autoHeight
                      height={height}
                      isScrolling={isScrolling}
                      onScroll={onChildScroll}
                      scrollTop={scrollTop}
                      width={width}
                      rowCount={rowCountCalculated}
                      rowHeight={cache.current.rowHeight}
                      rowRenderer={rowRenderer}
                      onRowsRendered={onRowsRendered}
                      ref={registerChild}
                      deferredMeasurementCache={cache.current}
                      overscanRowCount={3} // Add overscan for smoother scrolling
                    />
                  )}
                </InfiniteLoader>
              )
            }}
          </AutoSizer>
        )}
      </WindowScroller>
      {isLoadingMore && (
        <div className="py-4 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

// Simple Expander Component to replace the imported one if needed, or reuse existing
// Reusing existing Expander component but we need to import it.
// Wait, I removed the import in the previous chunk. I should add it back or re-implement.
// I'll assume Expander is still needed. I'll add the import back in the first chunk or use the one from components.
// Actually I removed it in the first chunk. I should have kept it.
// I will re-add the import in this chunk by adding it to the top of the file? No, I can't edit the top again easily.
// I'll just use the existing Expander component. I need to import it.
// Ah, I can't add import here.
// I'll fix the import in the first chunk.

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
      // Check if the processed video belongs to this channel
      // First check if the video metadata has the matching channel ID
      const processedVideoInChannel = videoMetadata?.channelId === channelId ||
        videos.some(v => v.videoId === processingVideoId)

      if (processedVideoInChannel) {
        // Revalidate the visparks data to show the new video
        mutateVisparks()
      }
    }
  }, [status, processingVideoId, channelId, videos, mutateVisparks, videoMetadata])

  // Revalidate visparks data when component mounts or gains focus
  useEffect(() => {
    const handleFocus = () => {
      mutateVisparks()
    }

    // Add focus event listener to refresh data when user returns to the page
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
                  <div className="flex items-center space-x-2 px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-300">
                    <VideoCameraIcon weight="fill" className="w-4 h-4" />
                    <span>{videoCount.toLocaleString()}</span>
                  </div>
                  {subscriberCount && (
                    <div className="flex items-center space-x-2 px-2 py-1 rounded-full bg-purple-500/10 text-purple-300">
                      <UsersIcon weight="fill" className="w-4 h-4" />
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
        <div className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/50">
          <button
            type="button"
            className="sticky top-0 z-10 flex items-center justify-between cursor-pointer p-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl transition-all duration-200 hover:bg-gray-800/50 w-full"
            onClick={() => setExpandedSection(expandedSection === 'libraries' ? null : 'libraries')}
          >
            <div className="flex items-center space-x-3">
              <div className={`transform transition-transform duration-200 ${expandedSection === 'libraries' ? 'rotate-180' : ''}`}>
                <CaretDownIcon className="w-5 h-5 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Libraries</h2>
            </div>
          </button>
          {expandedSection === 'libraries' && (
            <div className="pl-3 py-2 bg-gray-900/30">
              <VirtualizedContentGrid
                items={[
                  ...visparks.map(vispark => ({
                    id: vispark.id,
                    videoId: vispark.video_id,
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
            </div>
          )}
        </div>

        {/* Discover Expander */}
        <div className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/50">
          <button
            type="button"
            className="sticky top-0 z-10 flex items-center justify-between cursor-pointer p-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl transition-all duration-200 hover:bg-gray-800/50 w-full"
            onClick={() => setExpandedSection(expandedSection === 'discover' ? null : 'discover')}
          >
            <div className="flex items-center space-x-3">
              <div className={`transform transition-transform duration-200 ${expandedSection === 'discover' ? 'rotate-180' : ''}`}>
                <CaretDownIcon className="w-5 h-5 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Discover</h2>
            </div>
          </button>
          {expandedSection === 'discover' && (
            <div className="pl-3 py-2 bg-gray-900/30">
              <VirtualizedContentGrid
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChannelPage
