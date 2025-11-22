import { useTranslation } from "react-i18next"
import { WarningCircleIcon, StarIcon } from "@phosphor-icons/react"
import { useSubscribedChannels } from "@/hooks/useChannels"
import { ChannelList } from "@/components"
import { CountBadge, LoadingSkeleton, EmptyStateIllustration } from "@/components"

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
                <StarIcon
                  size={20}
                  className="text-green-400"
                  weight="fill"
                />
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
                  <StarIcon
                    size={20}
                    className="text-green-400"
                    weight="fill"
                  />
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
          <EmptyStateIllustration type="no-results" />
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
              <WarningCircleIcon
                size={20}
                className="text-red-400"
                weight="fill"
              />
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
