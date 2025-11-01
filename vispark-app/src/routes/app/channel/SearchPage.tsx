import { type FormEvent, useEffect, useId, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import {
  type ChannelMetadata,
  getSubscribedChannels,
  searchChannels,
} from "@/services/channel.ts"
import ChannelList from "./components/ChannelList"

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-indigo-300"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <title>Search icon</title>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
)

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

const ChannelSearchPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [subscribedChannels, setSubscribedChannels] = useState<
    ChannelMetadata[]
  >([])
  const [loading, setLoading] = useState(false)
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const reactId = useId()
  const inputId = useMemo(() => `channel-search-${reactId}`, [reactId])

  // Load subscribed channels on component mount
  useEffect(() => {
    const loadSubscribedChannels = async () => {
      setLoadingSubscriptions(true)
      try {
        const channels = await getSubscribedChannels()
        setSubscribedChannels(channels)
      } catch (error) {
        console.error("Failed to load subscribed channels:", error)
        // Set empty array to prevent infinite loading state
        setSubscribedChannels([])
      } finally {
        setLoadingSubscriptions(false)
      }
    }

    loadSubscribedChannels()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) {
      return
    }

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const results = await searchChannels(trimmedQuery)
      setSearchResults(results)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while searching for channels."
      setError(message)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleChannelClick = (channelId: string) => {
    navigate(`/app/channel/${channelId}`)
  }

  // Convert ChannelMetadata to YouTubeSearchResult format for ChannelList
  const convertToYouTubeSearchResult = (channel: ChannelMetadata): any => {
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pattern-bg min-h-screen">
      {/* Header Section */}
      <div className="sticky top-0 z-10 animate-slideInFromTop">
        <div className="glass-effect rounded-2xl p-6 shadow-2xl border border-white/10">
          <div className="mb-4">
            <h1 className="text-3xl font-bold bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Discover Channels
            </h1>
            <p className="text-gray-400 text-sm">
              Explore and subscribe to your favorite YouTube creators
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-label="Search for channels"
          >
            <div className="relative group">
              <input
                id={inputId}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder=""
                className="w-full pl-4 pr-32 py-4 glass-effect rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-300 text-lg shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-4 z-10"
                aria-label="Search for channels"
                disabled={!searchQuery.trim() || loading}
              >
                <div className="p-2 rounded-lg bg-linear-to-br from-indigo-500/20 to-purple-500/20 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                  <SearchIcon />
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="animate-fadeIn">
          <div className="glass-effect rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-300 mb-4 animate-pulse-slow">
              Searching for channels...
            </h2>
            <LoadingSkeleton />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
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
                Something went wrong
              </h3>
              <p className="text-red-300/70 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Subscribed Channels Loading State */}
      {loadingSubscriptions && (
        <div className="animate-fadeIn">
          <div className="glass-effect rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-linear-to-br from-green-500/20 to-emerald-500/20">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Star icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Subscribed Channels
              </h2>
            </div>
            <LoadingSkeleton />
          </div>
        </div>
      )}

      {/* Subscribed Channels Section */}
      {subscribedChannels.length > 0
        && !loading
        && !loadingSubscriptions
        && !searchQuery.trim() && (
          <div className="animate-fadeIn">
            <div className="glass-effect rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg bg-linear-to-br from-green-500/20 to-emerald-500/20">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Star icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Subscribed Channels
                </h2>
                <span className="px-3 py-1 text-sm font-semibold bg-green-500/20 text-green-300 rounded-full">
                  {subscribedChannels.length}
                </span>
              </div>
              <ChannelList
                items={subscribedChannels.map(convertToYouTubeSearchResult)}
                onSelect={handleChannelClick}
              />
            </div>
          </div>
        )}

      {/* Search Results Section */}
      {searchResults.length > 0 && !loading && searchQuery.trim() && (
        <div className="animate-fadeIn">
          <div className="glass-effect rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
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
                Results
              </h2>
              <span className="px-3 py-1 text-sm font-semibold bg-indigo-500/20 text-indigo-300 rounded-full">
                {searchResults.length} channels
              </span>
            </div>
            <ChannelList
              items={searchResults}
              onSelect={handleChannelClick}
            />
          </div>
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && searchResults.length === 0 && hasSearched && (
        <div className="glass-effect rounded-2xl p-8 text-center animate-fadeIn">
          <EmptyStateIllustration type="no-results" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No channels found
          </h3>
          <p className="text-gray-400 mb-4">
            No channels match "{searchQuery}". Try different keywords or check
            spelling.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="px-4 py-2 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  )
}

export default ChannelSearchPage
