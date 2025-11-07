import { GoogleOutlined } from "@ant-design/icons"
import { type FC, useEffect, useState } from "react"
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "@tanstack/react-router"
import { useAuth } from "@/modules/auth/useAuth.ts"

type SignUpFormValues = {
  email: string
  password: string
  confirmPassword: string
}


const SignUpPage: FC = () => {
  const {
    user,
    loading: authLoading,
    signUpWithPassword,
    signInWithGoogle,
  } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState<SignUpFormValues>({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const redirectPath =
    (location.state as any)?.from?.pathname
    ?? "/app"

  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white overflow-hidden relative">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            style={{
              top: `${10 + scrollY * 0.05}%`,
              left: `${10 - scrollY * 0.02}%`,
            }}
          />
          <div
            className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            style={{
              bottom: `${20 - scrollY * 0.03}%`,
              right: `${15 + scrollY * 0.01}%`,
            }}
          />
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="flex flex-col items-center gap-4">
              <img
                src="/logo.png"
                alt="VISPARK Logo"
                className="w-16 h-16 object-contain bg-white rounded-full"
              />
              <span className="text-2xl font-bold tracking-tight bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                VISPARK
              </span>
            </div>
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <Navigate
        to={redirectPath}
        replace
      />
    )
  }

  const handleInputChange = (field: keyof SignUpFormValues, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setErrorMessage("Please fill in all required fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please try again.")
      return
    }

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters")
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    const { email, password } = formData
    const error = await signUpWithPassword({ email, password })

    if (error) {
      setErrorMessage(error.message)
    } else {
      // Show success message (we'll need to implement a toast or alert)
      alert("Account created. Check your email to confirm before signing in.")
      setFormData({ email: "", password: "", confirmPassword: "" })
      navigate({
        to: "/login",
        replace: true,
      })
    }

    setSubmitting(false)
  }

  const handleGoogle = async () => {
    setSubmitting(true)
    setErrorMessage(null)
    const error = await signInWithGoogle()
    // On success, Supabase will redirect to Google then back to our app.
    if (error) {
      setErrorMessage(error.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          style={{
            top: `${10 + scrollY * 0.05}%`,
            left: `${10 - scrollY * 0.02}%`,
          }}
        />
        <div
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          style={{
            bottom: `${20 - scrollY * 0.03}%`,
            right: `${15 + scrollY * 0.01}%`,
          }}
        />
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md mx-auto">
          {/* Logo and Welcome Section */}
          <div className="text-center space-y-4 mb-6">
            <Link
              to="/"
              className="flex items-center justify-center gap-4"
            >
              <img
                src="/logo.png"
                alt="VISPARK Logo"
                className="w-16 h-16 object-contain bg-white rounded-full"
              />
              <span className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                VISPARK
              </span>
            </Link>
          </div>

          {/* Glassmorphic Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-white mb-0 text-xl font-semibold">
                  Create your VISPARK
                </h3>
                <p className="text-zinc-400 text-sm">
                  explore AI-powered video insights starting now
                </p>
              </div>

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-lg">
                  <div className="font-medium mb-1">Sign up error</div>
                  <div className="text-sm">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-zinc-300 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder:text-zinc-500 rounded-lg hover:border-white/40 focus:border-blue-400 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder:text-zinc-500 rounded-lg hover:border-white/40 focus:border-blue-400 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-2">Confirm password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder:text-zinc-500 rounded-lg hover:border-white/40 focus:border-blue-400 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 border-0 h-12 font-medium shadow-lg hover:shadow-xl transition-all duration-200 mt-6 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating account...
                    </div>
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-linear-to-br rounded-full from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-400 text-sm">OR</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-zinc-700 font-normal h-12 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-zinc-700 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>Sign up with Google</span>
              </button>

              <div className="text-center pt-4">
                <span className="text-zinc-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/login",
                      })
                    }
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto bg-transparent border-none cursor-pointer"
                  >
                    Log in
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
