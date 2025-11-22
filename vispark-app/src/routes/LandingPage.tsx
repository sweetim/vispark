import {
  ArrowRightIcon,
  BrainIcon,
  ChartLineIcon,
  CheckCircleIcon,
  GlobeIcon,
  LightningIcon,
  PlayIcon,
  QuotesIcon,
  ShieldCheckIcon,
  SignInIcon,
  SparkleIcon,
  StarIcon,
  TrendUpIcon,
} from "@phosphor-icons/react"
import type { FC } from "react"
import { useEffect, useState } from "react"
import { Link, Navigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/modules/auth"
import { useLocale } from "@/contexts/LocaleContext"
import { AnimatedBackground } from "@/components"


const LandingPage: FC = () => {
  const { t, i18n } = useTranslation()
  const { changeLanguage } = useLocale()
  const [scrollY, setScrollY] = useState(0)
  const { user, loading } = useAuth()
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isLanguageDropdownOpen) {
        const target = event.target as Node
        const dropdown = document.getElementById('language-dropdown')
        if (dropdown && !dropdown.contains(target)) {
          setIsLanguageDropdownOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isLanguageDropdownOpen])

  // If user is logged in, redirect to app
  if (!loading && user) {
    return <Navigate to="/app" replace />
  }

  const features = [
    {
      icon: BrainIcon,
      title: t("landing.features.aiPowered.title"),
      description: t("landing.features.aiPowered.description"),
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: TrendUpIcon,
      title: t("landing.features.trendDetection.title"),
      description: t("landing.features.trendDetection.description"),
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: LightningIcon,
      title: t("landing.features.instantProcessing.title"),
      description: t("landing.features.instantProcessing.description"),
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: GlobeIcon,
      title: t("landing.features.multiLanguage.title"),
      description: t("landing.features.multiLanguage.description"),
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: ShieldCheckIcon,
      title: t("landing.features.securePrivate.title"),
      description: t("landing.features.securePrivate.description"),
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: ChartLineIcon,
      title: t("landing.features.analytics.title"),
      description: t("landing.features.analytics.description"),
      color: "from-red-500 to-pink-500",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: t("landing.testimonials.sarah.role"),
      company: t("landing.testimonials.sarah.company"),
      content: t("landing.testimonials.sarah.content"),
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: t("landing.testimonials.michael.role"),
      company: t("landing.testimonials.michael.company"),
      content: t("landing.testimonials.michael.content"),
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: t("landing.testimonials.emily.role"),
      company: t("landing.testimonials.emily.company"),
      content: t("landing.testimonials.emily.content"),
      rating: 5,
    },
  ]

  const pricingTiers = [
    {
      name: t("landing.pricing.starter.name"),
      price: t("landing.pricing.starter.price"),
      description: t("landing.pricing.starter.description"),
      features: [
        t("landing.pricing.starter.features.0"),
        t("landing.pricing.starter.features.1"),
        t("landing.pricing.starter.features.2"),
      ],
      cta: t("landing.pricing.starter.cta"),
      popular: false,
    },
    {
      name: t("landing.pricing.pro.name"),
      price: t("landing.pricing.pro.price"),
      period: t("landing.pricing.pro.period"),
      description: t("landing.pricing.pro.description"),
      features: [
        t("landing.pricing.pro.features.0"),
        t("landing.pricing.pro.features.1"),
        t("landing.pricing.pro.features.2"),
        t("landing.pricing.pro.features.3"),
        t("landing.pricing.pro.features.4"),
      ],
      cta: t("landing.pricing.pro.cta"),
      popular: true,
    },
    {
      name: t("landing.pricing.enterprise.name"),
      price: t("landing.pricing.enterprise.price"),
      description: t("landing.pricing.enterprise.description"),
      features: [
        t("landing.pricing.enterprise.features.0"),
        t("landing.pricing.enterprise.features.1"),
        t("landing.pricing.enterprise.features.2"),
        t("landing.pricing.enterprise.features.3"),
        t("landing.pricing.enterprise.features.4"),
      ],
      cta: t("landing.pricing.enterprise.cta"),
      popular: false,
    },
  ]

  const demoSteps = [
    {
      title: t("landing.howItWorks.step1.title"),
      description: t("landing.howItWorks.step1.description"),
    },
    {
      title: t("landing.howItWorks.step2.title"),
      description: t("landing.howItWorks.step2.description"),
    },
    {
      title: t("landing.howItWorks.step3.title"),
      description: t("landing.howItWorks.step3.description"),
    },
  ]

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 px-6 py-6 md:px-12 backdrop-blur-sm bg-zinc-950/50 border-b border-white/5 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight"
          >
            <img
              src="/logo.png"
              alt={t("landing.logoAlt")}
              className="w-8 h-8 object-contain bg-white rounded-full"
            />
            <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VISPARK
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="p-2 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200 flex items-center gap-2"
                aria-label={t("settings.language")}
              >
                <GlobeIcon size={16} />
                <span className="hidden md:inline text-sm font-medium">
                  {i18n.language === "ja" ? "日本語" : "English"}
                </span>
              </button>

              {isLanguageDropdownOpen && (
                <div id="language-dropdown" className="absolute right-0 top-full mt-2 bg-zinc-800 border border-white/20 rounded-lg shadow-lg z-50 min-w-[120px]">
                  <button
                    type="button"
                    onClick={() => {
                      changeLanguage("en")
                      setIsLanguageDropdownOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 transition-colors flex items-center gap-2 ${
                      i18n.language === "en" ? "bg-zinc-700 text-white" : "text-gray-300"
                    }`}
                  >
                    <span>🇺🇸</span>
                    <span>{t("settings.english")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      changeLanguage("ja")
                      setIsLanguageDropdownOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 transition-colors flex items-center gap-2 ${
                      i18n.language === "ja" ? "bg-zinc-700 text-white" : "text-gray-300"
                    }`}
                  >
                    <span>🇯🇵</span>
                    <span>{t("settings.japanese")}</span>
                  </button>
                </div>
              )}
            </div>

            <Link
              to="/login"
              className="p-2 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200 md:flex md:items-center md:gap-2 md:px-4 md:py-2 md:text-sm md:font-medium"
              aria-label={t("landing.login")}
            >
              <SignInIcon size={16} />
              <span className="hidden md:inline">{t("landing.login")}</span>
            </Link>
            <Link
              to="/signup"
              className="p-2 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 transition-all duration-200 text-white shadow-lg hover:shadow-xl md:flex md:items-center md:gap-2 md:px-4 md:py-2 md:text-sm md:font-medium"
              aria-label={t("landing.getStarted")}
            >
              <SparkleIcon size={16} />
              <span className="hidden md:inline">{t("landing.getStarted")}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative pt-20">
        {/* Hero Section */}
        <section className="relative px-6 pt-8 pb-24 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
              <div className="flex-1 space-y-8 text-center lg:text-left">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium">
                    <SparkleIcon size={16} />
                    <span>{t("landing.poweredByAI")}</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl text-white leading-tight font-bold">
                    Transform{" "}
                    <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      YouTube Content
                    </span>{" "}
                    into Actionable Intelligence
                  </h1>
                  <p className="text-lg md:text-xl text-zinc-300 leading-relaxed">
                    {t("landing.subtitle")}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-center lg:justify-start">
                  <Link
                    to="/signup"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 transition-all duration-200 text-white font-medium shadow-lg hover:shadow-xl group"
                  >
                    {t("landing.startFreeAccount")}
                    <ArrowRightIcon
                      size={20}
                      weight="bold"
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200 text-white font-medium"
                  >
                    <PlayIcon size={20} />
                    {t("landing.watchDemo")}
                  </button>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-zinc-400">
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon
                      size={16}
                      className="text-green-400"
                    />
                    <span>{t("landing.noCreditCard")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon
                      size={16}
                      className="text-green-400"
                    />
                    <span>{t("landing.freeSummaries")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon
                      size={16}
                      className="text-green-400"
                    />
                    <span>{t("landing.cancelAnytime")}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full max-w-2xl">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl rounded-lg overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <BrainIcon
                          size={24}
                          className="text-white"
                        />
                      </div>
                      <div>
                        <h4 className="text-white mb-0 text-lg font-semibold">
                          {t("landing.seeVISPARKInAction")}
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          {t("landing.realTimeAnalysis")}
                        </p>
                      </div>
                    </div>

                    <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg"
                          alt="Demo video"
                          className="w-20 h-14 rounded object-cover"
                        />
                        <div className="flex-1">
                          <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-linear-to-r from-blue-500 to-purple-500 rounded-full"></div>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">
                            {t("landing.analyzingVideo")}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {[
                          {
                            id: "extracting",
                            text: t("landing.extractingTopics"),
                          },
                          { id: "generating", text: t("landing.generatingSummary") },
                          { id: "identifying", text: t("landing.identifyingTrends") },
                        ].map((step) => (
                          <div
                            key={step.id}
                            className="flex items-center gap-2"
                          >
                            <div
                              className={`h-2 w-2 rounded-full ${
                                step.id === "extracting"
                                || step.id === "generating"
                                  ? "bg-green-400"
                                  : "bg-zinc-600"
                              }`}
                            ></div>
                            <p
                              className={`text-sm ${
                                step.id === "extracting"
                                || step.id === "generating"
                                  ? "text-zinc-300"
                                  : "text-zinc-500"
                              }`}
                            >
                              {step.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <SparkleIcon
                          size={16}
                          className="text-yellow-400"
                        />
                        <p className="text-sm font-medium text-zinc-300">
                          {t("landing.aiGeneratedSummary")}
                        </p>
                      </div>
                      <ul className="space-y-1 text-sm text-zinc-400">
                        <li>
                          • {t("landing.keyConcept")}
                        </li>
                        <li>
                          • {t("landing.mainTakeaway")}
                        </li>
                        <li>
                          • {t("landing.trendMentioned")}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="px-6 py-16 md:px-12 bg-zinc-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-white text-3xl md:text-4xl font-bold">
                {t("landing.trustedBy", { count: 10000 })}
              </h2>
              <p className="text-zinc-300 text-lg max-w-2xl mx-auto">
                {t("landing.joinProfessionals")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={`testimonial-${testimonial.name}`}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 h-full"
                >
                  <div className="flex items-start gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon
                        key={`star-${testimonial.name}-${i}`}
                        size={16}
                        className="text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                  <QuotesIcon
                    size={24}
                    className="text-blue-400/20 mb-3"
                  />
                  <p className="text-zinc-300 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="block font-medium text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-16 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-white text-3xl md:text-4xl font-bold">
                {t("landing.features.title")}
              </h2>
              <p className="text-zinc-300 text-lg max-w-2xl mx-auto">
                {t("landing.features.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={`feature-${feature.title}`}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-300 group"
                >
                  <div
                    className={`h-12 w-12 rounded-lg bg-linear-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon
                      size={24}
                      className="text-white"
                    />
                  </div>
                  <h4 className="text-white mb-2 text-lg font-semibold">
                    {feature.title}
                  </h4>
                  <p className="text-zinc-300 mb-0">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="px-6 py-16 md:px-12 bg-zinc-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-white text-3xl md:text-4xl font-bold">
                {t("landing.howItWorks.title")}
              </h2>
              <p className="text-zinc-300 text-lg max-w-2xl mx-auto">
                {t("landing.howItWorks.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {demoSteps.map((step, index) => (
                <div
                  key={`step-${step.title}`}
                  className="relative"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                        {index + 1}
                      </div>
                      {index < demoSteps.length - 1 && (
                        <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-linear-to-r from-blue-500/50 to-purple-500/50 -translate-y-1/2"></div>
                      )}
                    </div>
                    <h4 className="text-white text-lg font-semibold">
                      {step.title}
                    </h4>
                    <p className="text-zinc-300">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 transition-all duration-200 text-white font-medium shadow-lg hover:shadow-xl group"
              >
                {t("landing.howItWorks.tryItNow")}
                <ArrowRightIcon
                  size={20}
                  weight="bold"
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="px-6 py-16 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-white text-3xl md:text-4xl font-bold">
                {t("landing.pricing.title")}
              </h2>
              <p className="text-zinc-300 text-lg max-w-2xl mx-auto">
                {t("landing.pricing.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingTiers.map((tier) => (
                <div
                  key={`tier-${tier.name}`}
                  className={`bg-white/5 backdrop-blur-sm border rounded-lg p-6 ${
                    tier.popular
                      ? "border-blue-500/50 ring-2 ring-blue-500/20"
                      : "border-white/10"
                  } hover:bg-white/10 transition-all duration-300 relative`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="px-3 py-1 bg-linear-to-r from-blue-500 to-purple-500 rounded-full text-white text-xs font-medium">
                        {t("landing.pricing.mostPopular")}
                      </div>
                    </div>
                  )}

                  <div className="text-center space-y-4">
                    <div>
                      <h3 className="text-white mb-1 text-xl font-semibold">
                        {tier.name}
                      </h3>
                      <p className="text-zinc-400 text-sm">
                        {tier.description}
                      </p>
                    </div>

                    <div className="py-4">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-white">
                          {tier.price}
                        </span>
                        {tier.period && (
                          <span className="text-zinc-400">{tier.period}</span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-3 text-left">
                      {tier.features.map((feature) => (
                        <li
                          key={`feature-${tier.name}-${feature}`}
                          className="flex items-center gap-2"
                        >
                          <CheckCircleIcon
                            size={16}
                            className="text-green-400 shrink-0"
                          />
                          <span className="text-zinc-300 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/signup"
                      className={`w-full block px-6 py-3 rounded-lg font-medium transition-all duration-200 text-center ${
                        tier.popular
                          ? "bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white shadow-lg"
                          : "border border-white/20 hover:border-white/40 hover:bg-white/5 text-white"
                      }`}
                    >
                      {tier.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 md:px-12 bg-linear-to-r from-blue-900/20 to-purple-900/20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-white text-3xl md:text-4xl font-bold">
              {t("landing.cta.title")}
            </h2>
            <p className="text-zinc-300 text-lg">
              {t("landing.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 transition-all duration-200 text-white font-medium shadow-lg hover:shadow-xl group"
              >
                {t("landing.cta.startFreeTrial")}
                <ArrowRightIcon
                  size={20}
                  weight="bold"
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200 text-white font-medium"
              >
                {t("landing.cta.loginToAccount")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 md:px-12 border-t border-white/10 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/logo.png"
                  alt="VISPARK Logo"
                  className="w-8 h-8 object-contain bg-white rounded-full"
                />
                <span className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  VISPARK
                </span>
              </div>
              <p className="text-zinc-400 text-sm mb-0">
                {t("landing.footer.description")}
              </p>
            </div>

          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10 text-zinc-400 text-sm">
            <span>
              {t("landing.footer.copyright", { year: new Date().getFullYear() })}
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
