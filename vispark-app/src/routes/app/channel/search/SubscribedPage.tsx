import { useTranslation } from "react-i18next"
import { useSubscribedChannels } from "@/hooks/useChannels"
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

const EmptyStateIllustration = () => {
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

const SubscribedPage = () => {
  const { t } = useTranslation()

  // SWR hooks for data
  const { channels: subscribedChannels, isLoading: loadingSubscriptions, error: subscriptionError } = useSubscribedChannels()

  return (
    <>
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
                {t("channels.subscribedChannels")}
              </h2>
            </div>
            <LoadingSkeleton />
          </div>
        </div>
      )}

      {/* Subscribed Channels Section */}
      {subscribedChannels.length > 0 && !loadingSubscriptions && (
        <div className="animate-fadeIn">
          <div className="glass-effect rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
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
                  Subscribed
                </h2>
              </div>
              <CountBadge count={subscribedChannels.length} />
            </div>
            <ChannelList
              items={subscribedChannels}
            />
          </div>
        </div>
      )}

      {/* Empty State when no subscribed channels */}
      {!loadingSubscriptions && subscribedChannels.length === 0 && (
        <div className="glass-effect rounded-2xl p-8 text-center animate-fadeIn">
          <EmptyStateIllustration />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            {t("channels.noSubscribedChannels")}
          </h3>
          <p className="text-gray-400">
            {t("channels.searchToSubscribe")}
          </p>
        </div>
      )}

      {/* Error State */}
      {subscriptionError && (
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
              <p className="text-red-300/70 text-sm">{subscriptionError}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SubscribedPage
