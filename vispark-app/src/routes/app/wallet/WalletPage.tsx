import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/modules/auth"
import { useAnalytics } from "@/hooks/useAnalytics"

const WalletPage = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { analytics, isLoading, error } = useAnalytics()
  const [activeTab, setActiveTab] = useState<"overview" | "insights" | "trends">("overview")

  // Calculate time saved from analytics data
  const totalHoursSaved = analytics ? Math.floor(analytics.totalTimeSavedMinutes / 60) : 0
  const remainingMinutes = analytics ? analytics.totalTimeSavedMinutes % 60 : 0

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full bg-gray-900 text-white p-4 overflow-y-auto">
        <div className="w-full max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">{t("analytics.title")}</h1>
            <p className="text-gray-400">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="flex flex-col h-full w-full bg-gray-900 text-white p-4 overflow-y-auto">
        <div className="w-full max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">{t("analytics.title")}</h1>
            <p className="text-red-400">{t("common.error")}</p>
            <button className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg">
              {t("common.retry")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 text-white p-4 overflow-y-auto">
      <div className="w-full max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{t("analytics.title")}</h1>
          <p className="text-gray-400">{t("analytics.subtitle")}</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">{t("analytics.visparkVideosProcessed")}</p>
              <p className="text-2xl font-bold text-indigo-400">
                {analytics.visparkVideosProcessed}
              </p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">{t("analytics.timesSavedFromApp")}</p>
              <p className="text-2xl font-bold text-green-400">
                {totalHoursSaved}h {remainingMinutes}m
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            {t("analytics.overview")}
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === "insights"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("insights")}
          >
            {t("analytics.insights")}
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === "trends"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("trends")}
          >
            {t("analytics.trends")}
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">{t("analytics.usageStats")}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t("analytics.videosSummarized")}</span>
                  <span>{analytics.totalVideosSummarized}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t("analytics.totalTimeSaved")}</span>
                  <span className="text-green-400 font-semibold">
                    {totalHoursSaved}h {remainingMinutes}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t("analytics.daysActive")}</span>
                  <span>{analytics.daysActive}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t("analytics.weeklyActivity")}</span>
                  <span>{analytics.weeklyVideosProcessed} videos</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">{t("analytics.accountInformation")}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t("analytics.memberSince")}</span>
                  <span>{new Date(user?.created_at || "").toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t("analytics.accountType")}</span>
                  <span className="text-indigo-400">{t("analytics.free")}</span>
                </div>
              </div>
            </div>

            {/* Upgrade Prompt */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">{t("analytics.upgradeToUnlock")}</h3>
              <p className="text-sm mb-3">{t("analytics.upgradePromptDescription")}</p>
              <button className="w-full py-2 px-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                {t("analytics.upgradeNow")}
              </button>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === "insights" && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">{t("analytics.insightsTitle")}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t("analytics.mostProductiveDay")}</span>
                  <span>{analytics.mostProductiveDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t("analytics.favoriteCategory")}</span>
                  <span>{analytics.favoriteCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t("analytics.learningEfficiency")}</span>
                  <span className="text-green-400 font-semibold">{analytics.learningEfficiency}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t("analytics.timeSavedPerWeek")}</span>
                  <span className="text-green-400 font-semibold">{analytics.timeSavedPerWeek} min</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">{t("analytics.weeklyActivity")}</h3>
              <div className="space-y-2">
                {analytics.weeklyActivity.map((day) => (
                  <div key={day.day} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 w-8">{day.day}</span>
                    <div className="flex-1 mx-3 bg-gray-700 rounded-full h-2 relative">
                      <div
                        className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, (day.videos / 5) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm w-8 text-right">{day.videos}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">{t("analytics.topCategories")}</h3>
              <div className="space-y-2">
                {analytics.topCategories.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <span className="text-sm">{category.name}</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-400">{category.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === "trends" && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">{t("analytics.trendingTopics")}</h3>
              <div className="space-y-3">
                {analytics.trendingTopics.map((topic) => (
                  <div key={topic.topic} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{topic.topic}</p>
                      <p className="text-sm text-gray-400">{topic.mentions} mentions</p>
                    </div>
                    <div className="flex items-center text-green-400">
                      <span className="text-sm font-semibold">+{topic.growth}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">{t("analytics.premiumFeatures")}</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-600 rounded-full mr-3"></div>
                  <span className="text-sm">{t("analytics.advancedAnalytics")}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-600 rounded-full mr-3"></div>
                  <span className="text-sm">{t("analytics.detailedTrends")}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-600 rounded-full mr-3"></div>
                  <span className="text-sm">{t("analytics.customReports")}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-600 rounded-full mr-3"></div>
                  <span className="text-sm">{t("analytics.exportData")}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-600 rounded-full mr-3"></div>
                  <span className="text-sm">{t("analytics.apiAccess")}</span>
                </div>
              </div>
              <button className="w-full mt-4 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-lg">
                {t("analytics.upgradeNow")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletPage
