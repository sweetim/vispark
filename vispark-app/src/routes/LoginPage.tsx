import { type FC, useState } from "react"
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"
import { useAuth } from "@/modules/auth/useAuth.ts"
import { AnimatedBackground, AuthFormContainer, FormInput, GoogleAuthButton, LoadingSpinner } from "@/components"

type LoginFormValues = {
  email: string
  password: string
  remember: boolean
}

const LoginPage: FC = () => {
  const { t } = useTranslation()
  const {
    user,
    loading: authLoading,
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
        <AnimatedBackground scrollY={scrollY} />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
              <Link
                to="/"
                className="flex items-center justify-center gap-4"
              >
                <img
                  src="/logo.png"
                  alt={t("landing.logoAlt")}
                  className="w-16 h-16 object-contain bg-white rounded-full"
                />
                <span className="text-2xl font-bold tracking-tight bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  VISPARK
                </span>
              </Link>
              <LoadingSpinner size="lg" color="indigo" />
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
      <AnimatedBackground scrollY={scrollY} />

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

          <AuthFormContainer title={t("auth.signInToVISPARK")} subtitle={t("auth.welcomeBack")}>
            <GoogleAuthButton
              onClick={handleGoogleSignIn}
              disabled={submitting}
              type="signIn"
            />

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-linear-to-br rounded-full from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-400 text-sm">{t("auth.or")}</span>
                </div>
              </div>

              {errorMessage && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-lg">
                  <div className="font-medium mb-1">{t("auth.authenticationError")}</div>
                  <div className="text-sm">{errorMessage}</div>
                </div>
              )}

              <FormInput
                label={t("auth.email")}
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                autoComplete="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />

              <div>
                <label className="block text-zinc-300 mb-2">{t("auth.password")}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.passwordPlaceholder")}
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
                      <EyeSlashIcon size={20} />
                    ) : (
                      <EyeIcon size={20} />
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
                  {t("auth.rememberMe")}
                </label>
                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto bg-transparent border-none cursor-pointer"
                >
                  {t("auth.forgotPassword")}
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 border-0 h-12 font-medium shadow-lg hover:shadow-xl transition-all duration-200 mt-6 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" color="white" />
                    {t("auth.signingIn")}
                  </div>
                ) : (
                  t("auth.signIn")
                )}
              </button>

              <div className="text-center pt-4">
                <span className="text-zinc-400">
                  {t("auth.newToVISPARK")}{" "}
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/signup",
                      })
                    }
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto bg-transparent border-none cursor-pointer"
                  >
                    {t("auth.createAccount")}
                  </button>
                </span>
              </div>
          </AuthFormContainer>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
