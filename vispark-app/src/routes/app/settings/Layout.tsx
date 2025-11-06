import { Outlet, useNavigate, useLocation } from "react-router"
import { useTranslation } from "react-i18next"

const SettingsLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  // Show back button only on child pages, not on the main settings page
  const showBackButton = location.pathname !== "/app/settings"

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/app/settings/profile":
        return t("settings.profile")
      case "/app/settings/account":
        return t("settings.account")
      case "/app/settings/preferences":
        return t("settings.preferences")
      default:
        return ""
    }
  }

  return (
    <div className="relative h-full w-full bg-slate-950 text-white flex flex-col">
      {/* Sticky Top Bar with Back Button and Page Title */}
      {showBackButton && (
        <div className="flex-shrink-0 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/app/settings")}
                className="flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm text-gray-300 hover:text-white transition-all duration-200 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>{t("settings.title")}</span>
              </button>

              <h1 className="text-2xl font-bold text-white">
                {getPageTitle()}
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* Content area with flexible height */}
      <div className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </div>
    </div>
  )
}

export default SettingsLayout
