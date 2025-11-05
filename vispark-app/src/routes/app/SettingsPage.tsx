import { useState } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "@/modules/auth"

const SettingsPage = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState(false)

  const displayName =
    user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? user?.user_metadata?.user_name
    ?? user?.email
    ?? "Anonymous User"

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
          error.message ?? "Failed to sign out. Please try again.",
        )
        setSigningOut(false)
        return
      }

      navigate("/login", { replace: true })
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Unexpected error during sign out.",
      )
      setSigningOut(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gray-900 text-white p-4">
      <div className="w-full max-w-lg bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
        <div className="flex flex-col items-center gap-4 text-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${displayName} avatar`}
              onError={() => setAvatarError(true)}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-700 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-semibold">
              {userInitial}
            </div>
          )}

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{displayName}</h1>
            {user?.email && (
              <p className="text-sm text-gray-300">{user.email}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full py-3 bg-red-600 hover:bg-red-500 transition-colors rounded-lg font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingOut ? "Signing out..." : "Log out"}
        </button>

        {errorMessage && (
          <p className="text-sm text-red-400 text-center">{errorMessage}</p>
        )}
      </div>
    </div>
  )
}

export default SettingsPage
