import { type FC, useEffect, useState } from "react"
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/modules/auth/useAuth.ts"
import { AnimatedBackground, AuthFormContainer, FormInput, GoogleAuthButton, LoadingSpinner } from "@/components"

type SignUpFormValues = {
  email: string
  password: string
  confirmPassword: string
}


const SignUpPage: FC = () => {
  const { t } = useTranslation()
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
      setErrorMessage(t("common.error"))
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage(t("auth.passwordsDoNotMatch"))
      return
    }

    if (formData.password.length < 8) {
      setErrorMessage(t("auth.passwordMinLength"))
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
      alert(t("auth.accountCreated"))
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
      <AnimatedBackground scrollY={scrollY} />

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

          <AuthFormContainer title={t("auth.createYourVISPARK")} subtitle={t("auth.exploreAIPowered")}>
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-lg">
                <div className="font-medium mb-1">{t("auth.signUpError")}</div>
                <div className="text-sm">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label={t("auth.email")}
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                autoComplete="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />

              <FormInput
                label={t("auth.password")}
                type="password"
                placeholder={t("auth.passwordPlaceholder")}
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />

              <FormInput
                label={t("auth.confirmPassword")}
                type="password"
                placeholder={t("auth.passwordPlaceholder")}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 border-0 h-12 font-medium shadow-lg hover:shadow-xl transition-all duration-200 mt-6 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" color="white" />
                    {t("auth.creatingAccount")}
                  </div>
                ) : (
                  t("auth.signUp")
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-linear-to-br rounded-full from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-400 text-sm">{t("auth.or")}</span>
              </div>
            </div>

            <GoogleAuthButton
              onClick={handleGoogle}
              disabled={submitting}
              type="signUp"
            />

            <div className="text-center pt-4">
              <span className="text-zinc-400">
                {t("auth.alreadyHaveAccount")}{" "}
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/login",
                    })
                  }
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto bg-transparent border-none cursor-pointer"
                >
                  {t("auth.logIn")}
                </button>
              </span>
            </div>
          </AuthFormContainer>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
