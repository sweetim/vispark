import { useState } from "react"
import { useAuth } from "@/modules/auth"
import { useTranslation } from "react-i18next"

const ProfilePage = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
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

  return (
    <div className="relative h-full">
      <div className="pointer-events-none absolute -top-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/25 blur-3xl" />
      <div className="pointer-events-none absolute top-20 left-[-12%] h-96 w-96 rounded-full bg-blue-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-18%] right-[-8%] h-96 w-96 rounded-full bg-emerald-500/20 blur-[140px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-10">
        <header className="mb-8">
          <p className="mt-2 max-w-2xl text-base text-gray-300/90 sm:text-lg">
            Manage your personal information and profile settings
          </p>
        </header>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.75)] backdrop-blur-xl">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-medium text-white">{t("settings.accountInfo")}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t("settings.email")}
                  </label>
                  <p className="text-sm text-white">{user?.email || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t("settings.memberSince")}
                  </label>
                  <p className="text-sm text-white">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t("settings.accountType")}
                  </label>
                  <p className="text-sm text-white">{t("settings.personal")}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors">
                  Edit Profile
                </button>
                <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-white font-medium rounded-xl transition-colors">
                  Change Avatar
                </button>
              </div>
            </div>
          </div>

          {/* Avatar Section */}
          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.75)] backdrop-blur-xl">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-medium text-white">Profile Picture</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-6">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={t("settings.avatarAlt", { name: displayName })}
                    onError={() => setAvatarError(true)}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-700"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-semibold text-white">
                    {userInitial}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-white">{displayName}</h3>
                  <p className="text-sm text-gray-400">JPG, GIF or PNG. Max size of 2MB</p>
                  <button className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
                    Upload new picture
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
