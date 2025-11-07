import { Outlet, useNavigate, useLocation } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { match } from "ts-pattern"

type SettingsRoute = "/app/settings" | "/app/settings/profile" | "/app/settings/account" | "/app/settings/preferences"

const SettingsLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  // Show back button only on child pages, not on the main settings page
  const showBackButton = match(location.pathname as string)
    .with("/app/settings", () => false)
    .otherwise(() => true)

  // Get page title based on current route using ts-pattern
  const getPageTitle = (): string => {
    return match(location.pathname as SettingsRoute)
      .with("/app/settings/profile", () => t("settings.profile"))
      .with("/app/settings/account", () => t("settings.account"))
      .with("/app/settings/preferences", () => t("settings.preferences"))
      .with("/app/settings", () => "")
      .exhaustive()
  }

  return (
    <div className="relative h-svh w-full bg-gray-900 text-white flex flex-col">
      {/* Sticky Top Bar with Back Button and Page Title */}
      {showBackButton && (
        <div className="shrink-0 bg-gray-900/95 backdrop-blur-md border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate({ to: "/app/settings" })}
                className="flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm text-gray-300 hover:text-white transition-all duration-200 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>{getPageTitle()}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content area with flexible height */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default SettingsLayout
