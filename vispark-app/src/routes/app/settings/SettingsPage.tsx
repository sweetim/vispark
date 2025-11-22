import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useAuth } from "@/modules/auth"
import { useTranslation } from "react-i18next"
import { useAppVersion } from "@/hooks/useAppVersion"
import {
  UserIcon,
  IdentificationCardIcon,
  GearIcon,
  SparkleIcon
} from "@phosphor-icons/react"
import { PageHeader, GlassCard, UserAvatar, NavigationButton } from "@/components"

const SettingsPage = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const appVersion = useAppVersion()
  const [signingOut, setSigningOut] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState(false)

  const displayName =
    user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? user?.user_metadata?.user_name
    ?? user?.email
    ?? t("settings.anonymousUser")

  const rawAvatarUrl =
    user?.user_metadata?.avatar_url
    ?? user?.user_metadata?.picture
    ?? user?.user_metadata?.avatar
    ?? null

  const avatarUrl = avatarError ? null : rawAvatarUrl
  const userInitial = displayName.trim().charAt(0).toUpperCase() || "U"

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    setErrorMessage(null)

    try {
      const error = await signOut()
      if (error) {
        setErrorMessage(
          error.message ?? t("settings.signOutError"),
        )
        setSigningOut(false)
        return
      }

      navigate({ to: "/login", replace: true })
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : t("settings.unexpectedError"),
      )
      setSigningOut(false)
    }
  }

  return (
    <PageHeader
      title={t("settings.title")}
      subtitle={t("settings.subtitle")}
    >
      <div className="flex justify-center">
        <GlassCard className="w-full max-w-md">
          {/* User Profile Section */}
          <div className="flex flex-col items-center">
            <UserAvatar
              src={avatarUrl}
              alt={t("settings.avatarAlt", { name: displayName })}
              name={displayName}
              size="xl"
            />

            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-white">{displayName}</h3>
              {user?.email && (
                <p className="text-sm text-gray-300">{user.email}</p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-2">
            <NavigationButton
              icon={SparkleIcon}
              onClick={() => navigate({ to: "/app/settings/vispark" })}
            >
              {t("settings.vispark")}
            </NavigationButton>
            <NavigationButton
              icon={UserIcon}
              onClick={() => navigate({ to: "/app/settings/profile" })}
            >
              {t("settings.profile")}
            </NavigationButton>
            <NavigationButton
              icon={IdentificationCardIcon}
              onClick={() => navigate({ to: "/app/settings/account" })}
            >
              {t("settings.account")}
            </NavigationButton>
            <NavigationButton
              icon={GearIcon}
              onClick={() => navigate({ to: "/app/settings/preferences" })}
            >
              {t("settings.preferences")}
            </NavigationButton>
          </nav>

          {/* App Version */}
          <div className="px-4 py-2 border-t border-white/10">
            <div className="text-center">
              <p className="text-xs text-gray-400">
                Version: {appVersion}
              </p>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="p-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signingOut ? t("settings.signingOut") : t("settings.logout")}
            </button>

            {errorMessage && (
              <p className="text-sm text-red-400 text-center mt-3">{errorMessage}</p>
            )}
          </div>
        </GlassCard>
      </div>
    </PageHeader>
  )
}

export default SettingsPage
