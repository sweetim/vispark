import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { VideoCameraIcon, UsersIcon, BellIcon, BellSlashIcon } from "@phosphor-icons/react"
import UserAvatar from "./UserAvatar"

type ChannelHeaderProps = {
  channelName: string
  channelThumbnail?: string
  videoCount?: number
  subscriberCount?: number
  isSubscribed?: boolean
  onSubscriptionToggle?: () => void
  isLoading?: boolean
  error?: string
}

const ChannelHeader: FC<ChannelHeaderProps> = ({
  channelName,
  channelThumbnail,
  videoCount = 0,
  subscriberCount,
  isSubscribed = false,
  onSubscriptionToggle,
  isLoading = false,
  error
}) => {
  const { t } = useTranslation()

  if (isLoading) {
    return (
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
    )
  }

  if (error) {
    return (
      <div className="glass-effect border-b border-gray-800 px-6 py-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <h3 className="text-red-400 font-medium mb-2">
            {t("channels.errorLoadingChannel")}
          </h3>
          <p className="text-red-300/80 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-effect border-b border-gray-800 px-3 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <UserAvatar
            src={channelThumbnail}
            name={channelName}
            alt={channelName}
            size="md"
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
        {onSubscriptionToggle && (
          <button
            type="button"
            onClick={onSubscriptionToggle}
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
        )}
      </div>
    </div>
  )
}

export default ChannelHeader
