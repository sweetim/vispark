import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useSWRConfig } from "swr"
import { useAuth } from "@/modules/auth/useAuth.ts"
import { useToast } from "@/contexts/ToastContext.tsx"
import { useTranslation } from "react-i18next"
import type { ChannelMetadata } from "@/services/channel.ts"
import {
  areChannelsSubscribed,
  subscribeToChannel,
  unsubscribeFromChannel,
} from "@/services/channel.ts"

type ChannelListProps = {
  items: ChannelMetadata[]
  emptyMessage?: string
}

const defaultEmptyMessage = "No channels found."

const ChannelList = ({
  items,
  emptyMessage = defaultEmptyMessage,
}: ChannelListProps) => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutate: globalMutate } = useSWRConfig()
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    Record<string, boolean>
  >({})
  const [loadingChannels, setLoadingChannels] = useState<
    Record<string, boolean>
  >({})

  const getChannelId = useCallback((item: ChannelMetadata): string => {
    return item.channelId
  }, [])

  const getChannelTitle = useCallback((item: ChannelMetadata): string => {
    return item.channelTitle
  }, [])

  const getChannelThumbnail = useCallback(
    (item: ChannelMetadata): string => {
      return item.channelThumbnailUrl
    },
    [],
  )

  const handleSubscriptionToggle = useCallback(
    async (event: React.MouseEvent, channelId: string) => {
      event.stopPropagation() // Prevent triggering the onSelect callback

      if (!user) return

      const isSubscribed = subscriptionStatus[channelId] ?? false
      const channelItem = items.find(item => getChannelId(item) === channelId)
      const channelTitle = channelItem ? getChannelTitle(channelItem) : ""

      // Set loading state for this channel
      setLoadingChannels((prev) => ({
        ...prev,
        [channelId]: true,
      }))

      try {
        if (isSubscribed) {
          await unsubscribeFromChannel(channelId)
          setSubscriptionStatus((prev) => ({
            ...prev,
            [channelId]: false,
          }))
          showToast(
            t("channels.unsubscribedSuccess", { channelTitle }),
            "success"
          )

          // Refresh the subscribed channels cache to get the latest list
          globalMutate("subscribed-channels")
        } else {
          await subscribeToChannel(channelId)
          setSubscriptionStatus((prev) => ({
            ...prev,
            [channelId]: true,
          }))
          // Note: YouTube push notifications are now handled automatically in the backend
          showToast(
            t("channels.subscribedSuccess", { channelTitle }),
            "success"
          )

          // Refresh the subscribed channels cache to get the latest list
          globalMutate("subscribed-channels")
        }
      } catch (error) {
        console.error("Failed to toggle subscription:", error)
        const errorMessage = isSubscribed
          ? t("channels.unsubscribeError", { channelTitle })
          : t("channels.subscribeError", { channelTitle })
        showToast(errorMessage, "error")
      } finally {
        // Clear loading state for this channel
        setLoadingChannels((prev) => ({
          ...prev,
          [channelId]: false,
        }))
      }
    },
    [user, subscriptionStatus, items, getChannelId, getChannelTitle, showToast, t],
  )

  const handleChannelClick = useCallback((channelId: string) => {
    navigate({ to: `/app/channels/${channelId}` })
  }, [navigate])

  // Load subscription status when component mounts
  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      // Only load subscription status in batch
      if (user) {
        const channelIds = items
          .map(getChannelId)
          .filter((id) => id && subscriptionStatus[id] === undefined)

        if (channelIds.length > 0) {
          try {
            const status = await areChannelsSubscribed(channelIds)
            setSubscriptionStatus((prev) => ({
              ...prev,
              ...status,
            }))
          } catch (error) {
            console.error("Failed to load subscription status:", error)
          }
        }
      }
    }

    loadSubscriptionStatus()
  }, [
    items,
    subscriptionStatus,
    user,
    getChannelId,
  ])

  // No sorting needed since we don't have video count anymore
  const sortedItems = [...items]

  return (
    <section
      aria-label="Channel search results"
      className="space-y-2"
    >
      {items.length === 0 ? (
        <div className="text-sm text-gray-400 border border-dashed border-gray-700 rounded-lg px-4 py-6 text-center backdrop-blur-sm bg-gray-800/30">
          <svg
            className="w-8 h-8 mx-auto mb-2 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <title>No channels icon</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          {emptyMessage}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2">
          {sortedItems.map((item) => {
            const channelId = getChannelId(item)
            const channelTitle = getChannelTitle(item)
            const channelThumbnail = getChannelThumbnail(item)
            const isSubscribed = subscriptionStatus[channelId] ?? false
            const isLoading = loadingChannels[channelId] ?? false

            return (
              <li
                key={channelId}
                className="relative group"
              >
                <div
                  className="w-full text-left p-3 bg-linear-to-br from-gray-800 to-gray-900 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border border-gray-700/50 hover:border-indigo-500/30 cursor-pointer"
                  onClick={() => handleChannelClick(channelId)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View channel ${channelTitle}`}
                >
                  <div className="flex items-center space-x-3">
                    {channelThumbnail ? (
                      <img
                        src={channelThumbnail}
                        alt={channelTitle}
                        className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-gray-600 group-hover:ring-indigo-500 transition-all duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channelTitle)}&background=6366f1&color=fff&size=48`
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0 ring-2 ring-gray-600 group-hover:ring-indigo-500 transition-all duration-300">
                        {channelTitle.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-white truncate group-hover:text-indigo-300 transition-colors duration-200">
                        {channelTitle || "Unknown Channel"}
                      </h3>
                    </div>
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleSubscriptionToggle(e, channelId)}
                        disabled={isLoading}
                        className={`p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          isLoading
                            ? "bg-gray-500 cursor-not-allowed"
                            : isSubscribed
                            ? "bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-green-500/25"
                            : "bg-linear-to-r from-gray-600 to-gray-700 hover:from-indigo-500 hover:to-indigo-600 shadow-md hover:shadow-indigo-500/25 group-hover:scale-105"
                        }`}
                        aria-label={
                          isLoading
                            ? "Processing subscription"
                            : isSubscribed
                            ? "Unsubscribe from channel"
                            : "Subscribe to channel"
                        }
                      >
                        {isLoading ? (
                          // Loading spinner
                          <svg
                            className="w-4 h-4 text-white animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <title>Loading</title>
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : isSubscribed ? (
                          // Animated checkmark for subscribed channels
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <title>Checkmark</title>
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          // Animated bell icon for unsubscribed channels
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <title>Bell notification</title>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default ChannelList
