import { useNavigate, useSearch } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useChannelSearch } from "@/hooks/useChannels"
import ChannelList from "../components/ChannelList"
import CountBadge from "@/components/CountBadge"

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

const EmptyStateIllustration = ({
  type,
}: {
  type: "search" | "no-results"
}) => {
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

const SearchPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search = useSearch({ from: "/app/channels/search" })
  const searchQuery = (search as { q?: string }).q || ""

  // SWR hooks for data
  const { searchResults, isLoading: loadingSearch, error: searchError } = useChannelSearch(searchQuery, !!searchQuery)

  const handleChannelClick = (channelId: string) => {
    navigate({ to: `/app/channels/${channelId}` })
  }

  // Convert ChannelMetadata to YouTubeSearchResult format for ChannelList
  const convertToYouTubeSearchResult = (
    channel: any, // Using any to avoid type conflicts
  ) => {
    return {
      etag: channel.channelId,
      id: {
        kind: "youtube#channel",
        channelId: channel.channelId,
      },
      kind: "youtube#channel",
      snippet: {
        channelId: channel.channelId,
        channelTitle: channel.channelTitle,
        description: "",
        liveBroadcastContent: "none",
        publishTime: "",
        publishedAt: "",
        thumbnails: {
          default: { url: channel.channelThumbnailUrl },
          medium: { url: channel.channelThumbnailUrl },
          high: { url: channel.channelThumbnailUrl },
        },
        title: channel.channelTitle,
      },
    }
  }

  // If no search query, show empty state
  if (!searchQuery) {
    return (
      <div className="glass-effect rounded-2xl p-8 text-center animate-fadeIn">
        <EmptyStateIllustration type="search" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">
          {t("channels.searchForChannels")}
        </h3>
        <p className="text-gray-400">
          {t("channels.enterSearchQuery")}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Loading State */}
      {loadingSearch && (
        <div className="animate-fadeIn">
          <div className="glass-effect rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-300 mb-4 animate-pulse-slow">
              {t("channels.searchingChannels")}
            </h2>
            <LoadingSkeleton />
          </div>
        </div>
      )}

      {/* Error State */}
      {searchError && (
        <div className="glass-effect rounded-2xl p-6 border border-red-500/20 animate-fadeIn">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Error warning</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-red-400 font-semibold mb-1">
                {t("channels.somethingWentWrong")}
              </h3>
              <p className="text-red-300/70 text-sm">{searchError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Section */}
      {!loadingSearch && !searchError && searchResults.length > 0 && (
        <div className="animate-fadeIn">
          <div className="glass-effect rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-linear-to-br from-indigo-500/20 to-purple-500/20">
                  <svg
                    className="w-5 h-5 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Search icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {t("channels.results")}
                </h2>
              </div>
              <CountBadge count={searchResults.length} />
            </div>
            <ChannelList
              items={searchResults.map(convertToYouTubeSearchResult)}
              channelDetails={searchResults}
              onSelect={handleChannelClick}
            />
          </div>
        </div>
      )}

      {/* No Results State */}
      {!loadingSearch && !searchError && searchResults.length === 0 && (
        <div className="glass-effect rounded-2xl p-8 text-center animate-fadeIn">
          <EmptyStateIllustration type="no-results" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            {t("channels.noChannelsFound")}
          </h3>
          <p className="text-gray-400 mb-4">
            No channels match "{searchQuery}". Try different keywords or check
            spelling.
          </p>
        </div>
      )}
    </>
  )
}

export default SearchPage
