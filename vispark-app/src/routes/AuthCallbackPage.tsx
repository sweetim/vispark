import { useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { supabase } from "@/config/supabaseClient"

const AuthCallbackPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error during auth callback:", error)
          navigate({ to: "/login", search: { error: "auth_failed" } })
          return
        }

        if (data.session) {
          // Successfully authenticated
          navigate({ to: "/app" })
        } else {
          // No session found, redirect to login
          navigate({ to: "/login", search: { error: "no_session" } })
        }
      } catch (error) {
        console.error("Unexpected error during auth callback:", error)
        navigate({ to: "/login", search: { error: "unexpected_error" } })
      }
    }

    handleAuthCallback()
  }, [navigate])

  // Show loading state while processing the callback
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-500/30 rounded-full mx-auto mb-4"></div>
        <div className="w-16 h-16 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        <p className="text-white text-lg">Completing authentication...</p>
      </div>
    </div>
  )
}

export default AuthCallbackPage
