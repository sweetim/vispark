import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useAuth } from "@/modules/auth"
import { useTranslation } from "react-i18next"
import {
  UserIcon,
  IdentificationCardIcon,
  GearIcon,
  SparkleIcon
} from "@phosphor-icons/react"

const SettingsPage = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
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
    <div className="relative h-full overflow-hidden">
      <div className="pointer-events-none absolute -top-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/25 blur-3xl" />
      <div className="pointer-events-none absolute top-20 left-[-12%] h-96 w-96 rounded-full bg-blue-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-18%] right-[-8%] h-96 w-96 rounded-full bg-emerald-500/20 blur-[140px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 pb-20 sm:px-6 lg:px-10">
        <header className="mb-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white sm:text-5xl lg:text-6xl">
              {t("settings.title")}
            </h1>
            <p className="max-w-2xl text-base text-gray-300/90 sm:text-lg">
              {t("settings.subtitle")}
            </p>
          </div>
        </header>

        <div className="flex justify-center">
          {/* Sidebar Navigation */}
          <div className="w-full max-w-md">
            <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.75)] backdrop-blur-xl">
              {/* User Profile Section */}
              <div className="p-6 border-b border-white/10">
                <div className="flex flex-col items-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={t("settings.avatarAlt", { name: displayName })}
                      onError={() => setAvatarError(true)}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-semibold text-white">
                      {userInitial}
                    </div>
                  )}

                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-medium text-white">{displayName}</h3>
                    {user?.email && (
                      <p className="text-sm text-gray-300">{user.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                <button
                  className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3"
                  onClick={() => navigate({ to: "/app/settings/vispark" })}
                >
                  <SparkleIcon size={20} weight="duotone" />
                  {t("settings.vispark")}
                </button>
                <button
                  className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3"
                  onClick={() => navigate({ to: "/app/settings/profile" })}
                >
                  <UserIcon size={20} weight="duotone" />
                  {t("settings.profile")}
                </button>
                <button
                  className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3"
                  onClick={() => navigate({ to: "/app/settings/account" })}
                >
                  <IdentificationCardIcon size={20} weight="duotone" />
                  {t("settings.account")}
                </button>
                <button
                  className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3"
                  onClick={() => navigate({ to: "/app/settings/preferences" })}
                >
                  <GearIcon size={20} weight="duotone" />
                  {t("settings.preferences")}
                </button>
              </nav>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
