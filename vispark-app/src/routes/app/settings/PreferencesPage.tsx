import { useTranslation } from "react-i18next"
import { useLocale } from "@/contexts/LocaleContext"

const PreferencesPage = () => {
  const { t } = useTranslation()
  const { currentLanguage, changeLanguage } = useLocale()

  return (
    <div className="relative bg-slate-950 h-full">
      <div className="pointer-events-none absolute -top-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/25 blur-3xl" />
      <div className="pointer-events-none absolute top-20 left-[-12%] h-96 w-96 rounded-full bg-blue-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-18%] right-[-8%] h-96 w-96 rounded-full bg-emerald-500/20 blur-[140px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-10">
        <header className="mb-8">
          <p className="mt-2 max-w-2xl text-base text-gray-300/90 sm:text-lg">
            Customize your app experience and notification preferences
          </p>
        </header>

        <div className="space-y-6">
          {/* Language Settings */}
          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.75)] backdrop-blur-xl">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-medium text-white">{t("settings.language")}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => changeLanguage("en")}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    currentLanguage === "en"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  {t("settings.english")}
                </button>
                <button
                  type="button"
                  onClick={() => changeLanguage("ja")}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    currentLanguage === "ja"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  {t("settings.japanese")}
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.75)] backdrop-blur-xl">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-medium text-white">{t("settings.notifications")}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">{t("settings.emailNotifications")}</h3>
                  <p className="text-sm text-gray-400">Receive email updates about your account activity</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">{t("settings.pushNotifications")}</h3>
                  <p className="text-sm text-gray-400">Receive push notifications on your devices</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.75)] backdrop-blur-xl">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-medium text-white">Appearance</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">Dark Mode</h3>
                  <p className="text-sm text-gray-400">Use dark theme across the application</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">Compact View</h3>
                  <p className="text-sm text-gray-400">Show more content with reduced spacing</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreferencesPage
