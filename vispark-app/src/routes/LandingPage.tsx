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
import { useAuth } from "@/modules/auth"


const LandingPage: FC = () => {
  const [scrollY, setScrollY] = useState(0)
  const { user, loading } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // If user is logged in, redirect to app
  if (!loading && user) {
    return <Navigate to="/app" replace />
  }

  const features = [
    {
      icon: BrainIcon,
      title: "AI-Powered Summaries",
      description:
        "Transform hours of content into concise, actionable insights with advanced AI technology.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: TrendUpIcon,
      title: "Trend Detection",
      description:
        "Identify emerging topics and patterns across multiple channels to stay ahead of the curve.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: LightningIcon,
      title: "Instant Processing",
      description:
        "Get summaries and insights in seconds, not hours. Process multiple videos simultaneously.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: GlobeIcon,
      title: "Multi-Language Support",
      description:
        "Analyze content in multiple languages with accurate transcription and translation.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: ShieldCheckIcon,
      title: "Secure & Private",
      description:
        "Your data is encrypted and secure. We never share your information with third parties.",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: ChartLineIcon,
      title: "Analytics Dashboard",
      description:
        "Track your content consumption patterns and optimize your learning strategy.",
      color: "from-red-500 to-pink-500",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Strategist",
      company: "TechFlow Media",
      content:
        "VISPARK has revolutionized how I research content. I can now analyze 10x more videos in the same time.",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Research Analyst",
      company: "Market Insights Lab",
      content:
        "The AI summaries are incredibly accurate. It's like having a research assistant that works 24/7.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "YouTube Creator",
      company: "Emily Explains",
      content:
        "I use VISPARK to analyze competitor content and identify gaps in the market. It's been a game-changer.",
      rating: 5,
    },
  ]

  const pricingTiers = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for trying out VISPARK",
      features: [
        "5 video summaries per month",
        "Basic search functionality",
        "Email support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      description: "For serious content creators",
      features: [
        "Unlimited video summaries",
        "Advanced search & filters",
        "Trend analysis tools",
        "Priority support",
        "Custom categories",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "API access",
        "Custom integrations",
        "Dedicated support",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  const demoSteps = [
    {
      title: "Paste YouTube Link",
      description: "Simply paste any YouTube video URL to get started",
    },
    {
      title: "AI Processing",
      description: "Our AI analyzes the content and extracts key insights",
    },
    {
      title: "Get Insights",
      description: "Receive comprehensive summaries and actionable takeaways",
    },
  ]

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
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

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 px-6 py-6 md:px-12 backdrop-blur-sm bg-zinc-950/50 border-b border-white/5 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight"
          >
            <img
              src="/logo.png"
              alt="VISPARK Logo"
              className="w-8 h-8 object-contain bg-white rounded-full"
            />
            <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VISPARK
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="p-2 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200 md:flex md:items-center md:gap-2 md:px-4 md:py-2 md:text-sm md:font-medium"
              aria-label="Log in"
            >
              <SignInIcon size={16} />
              <span className="hidden md:inline">Log in</span>
            </Link>
            <Link
              to="/signup"
              className="p-2 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 transition-all duration-200 text-white shadow-lg hover:shadow-xl md:flex md:items-center md:gap-2 md:px-4 md:py-2 md:text-sm md:font-medium"
              aria-label="Get started"
            >
              <SparkleIcon size={16} />
              <span className="hidden md:inline">Get started</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative pt-20">
        {/* Hero Section */}
        <section className="relative px-6 pt-16 pb-24 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
              <div className="flex-1 space-y-8 text-center lg:text-left">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium">
                    <SparkleIcon size={16} />
                    <span>Powered by Advanced AI</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl text-white leading-tight font-bold">
                    Transform{" "}
                    <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      YouTube Content
                    </span>{" "}
                    into Actionable Intelligence
                  </h1>
                  <p className="text-lg md:text-xl text-zinc-300 leading-relaxed">
                    Extract summaries, identify trends, and generate insights
                    from the creators you follow. Stay ahead without watching
                    every upload.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-center lg:justify-start">
                  <Link
                    to="/signup"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 transition-all duration-200 text-white font-medium shadow-lg hover:shadow-xl group"
                  >
                    Start your free account
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
                    Watch demo
                  </button>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-zinc-400">
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon
                      size={16}
                      className="text-green-400"
                    />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon
                      size={16}
                      className="text-green-400"
                    />
                    <span>5 free summaries</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon
                      size={16}
                      className="text-green-400"
                    />
                    <span>Cancel anytime</span>
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
                          See VISPARK in Action
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Real-time analysis of any YouTube video
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
                            Analyzing video content...
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {[
                          {
                            id: "extracting",
                            text: "Extracting key topics...",
                          },
                          { id: "generating", text: "Generating summary..." },
                          { id: "identifying", text: "Identifying trends..." },
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
                          AI-Generated Summary
                        </p>
                      </div>
                      <ul className="space-y-1 text-sm text-zinc-400">
                        <li>
                          • Key concept: Machine learning applications in
                          content analysis
                        </li>
                        <li>
                          • Main takeaway: AI can reduce research time by 80%
                        </li>
                        <li>
                          • Trend mentioned: Growing adoption of AI tools in
                          content creation
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
                Trusted by{" "}
                <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  10,000+
                </span>{" "}
                Content Professionals
              </h2>
              <p className="text-zinc-300 text-lg max-w-2xl mx-auto">
                Join researchers, creators, and strategists who are saving hours
                every week with VISPARK
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
                Powerful Features for{" "}
                <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Content Intelligence
                </span>
              </h2>
              <p className="text-zinc-300 text-lg max-w-2xl mx-auto">
                Everything you need to extract maximum value from video content
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
                See How It{" "}
                <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Works
                </span>
              </h2>
              <p className="text-zinc-300 text-lg max-w-2xl mx-auto">
                Transform any YouTube video into actionable insights in three
                simple steps
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
                Try it now
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
                Simple, Transparent{" "}
                <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Pricing
                </span>
              </h2>
              <p className="text-zinc-300 text-lg max-w-2xl mx-auto">
                Choose the plan that works best for your content analysis needs
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
                        Most Popular
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
              Ready to Transform Your{" "}
              <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Content Workflow
              </span>
              ?
            </h2>
            <p className="text-zinc-300 text-lg">
              Join thousands of professionals who are saving hours every week
              with VISPARK
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 transition-all duration-200 text-white font-medium shadow-lg hover:shadow-xl group"
              >
                Start your free trial
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
                Log in to existing account
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
                Transform YouTube content into actionable insights with
                AI-powered analysis.
              </p>
            </div>

          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10 text-zinc-400 text-sm">
            <span>
              &copy; {new Date().getFullYear()} VISPARK. All rights reserved.
            </span>
            <div className="flex gap-6">
              <a
                href="https://vispark.xyz"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
