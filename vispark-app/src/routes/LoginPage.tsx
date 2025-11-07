import { GoogleOutlined } from "@ant-design/icons"
import { type FC, useState } from "react"
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "@tanstack/react-router"
import { useAuth } from "@/modules/auth/useAuth.ts"

type LoginFormValues = {
  email: string
  password: string
  remember: boolean
}

const LoginPage: FC = () => {
  const {
    user,
    loading: authLoading,
    signInWithPassword,
    signInWithGoogle,
  } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState<LoginFormValues>({
    email: "",
    password: "",
    remember: true,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const scrollY = 0

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
            <Link
              to="/"
              className="flex items-center justify-center gap-4"
            >
              <img
                src="/logo.png"
                alt="VISPARK Logo"
                className="w-16 h-16 object-contain bg-white rounded-full"
              />
              <span className="text-2xl font-bold tracking-tight bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                VISPARK
              </span>
            </Link>
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

  const handleInputChange = (field: keyof LoginFormValues, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      setErrorMessage("Please fill in all required fields")
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    const error = await signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      setErrorMessage(error.message)
    } else {
      setFormData({ email: "", password: "", remember: true })
      navigate({ to: redirectPath, replace: true })
    }

    setSubmitting(false)
  }

  const handleGoogleSignIn = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    const error = await signInWithGoogle()

    if (error) {
      setErrorMessage(error.message)
      setSubmitting(false)
    }
    // Note: Google OAuth will redirect, so we don't need to navigate here
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

      <div className="flex items-center justify-center min-h-screen  p-4">
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
              <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                VISPARK
              </span>
            </Link>
          </div>

          {/* Glassmorphic Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
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
                <span>Sign in with Google</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-linear-to-br rounded-full from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-400 text-sm">OR</span>
                </div>
              </div>

              {errorMessage && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-lg">
                  <div className="font-medium mb-1">Authentication error</div>
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
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/20 text-white placeholder:text-zinc-500 rounded-lg hover:border-white/40 focus:border-blue-400 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center text-zinc-300">
                    <input
                      type="checkbox"
                      checked={formData.remember}
                      onChange={(e) => handleInputChange("remember", e.target.checked)}
                      className="mr-2 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto bg-transparent border-none cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 border-0 h-12 font-medium shadow-lg hover:shadow-xl transition-all duration-200 mt-6 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="text-center pt-4">
                <span className="text-zinc-400">
                  New to VISPARK?{" "}
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/signup",
                      })
                    }
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto bg-transparent border-none cursor-pointer"
                  >
                    Create an account
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

export default LoginPage
