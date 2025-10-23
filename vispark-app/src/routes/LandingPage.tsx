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
  SparkleIcon,
  StarIcon,
  TrendUpIcon,
} from "@phosphor-icons/react"
import { Card, Typography } from "antd"
import type { FC } from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router"

const { Title, Paragraph, Text } = Typography

const LandingPage: FC = () => {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
    <div className="min-h-screen w-full bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white overflow-hidden">
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

      {/* Header */}
      <header className="relative px-6 py-6 md:px-12 backdrop-blur-sm bg-zinc-950/50 border-b border-white/5 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight"
          >
            <SparkleIcon
              className="text-blue-400"
              size={24}
              weight="fill"
            />
            <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VISPARK
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200 text-sm font-medium"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 transition-all duration-200 text-white font-medium text-sm shadow-lg hover:shadow-xl"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
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
                  <Title className="text-!4xl md:text-!5xl lg:text-6xl! text-!white leading-!tight font-!bold">
                    Transform{" "}
                    <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      YouTube Content
                    </span>{" "}
                    into Actionable Intelligence
                  </Title>
                  <Paragraph className="text-!lg md:text-!xl text-!zinc-300 leading-!relaxed">
                    Extract summaries, identify trends, and generate insights
                    from the creators you follow. Stay ahead without watching
                    every upload.
                  </Paragraph>
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
                <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <BrainIcon
                          size={24}
                          className="text-white"
                        />
                      </div>
                      <div>
                        <Title
                          level={4}
                          className="text-!white mb-!0"
                        >
                          See VISPARK in Action
                        </Title>
                        <Text className="text-zinc-400 text-sm">
                          Real-time analysis of any YouTube video
                        </Text>
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
                          <Text className="text-xs text-zinc-400 mt-1">
                            Analyzing video content...
                          </Text>
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
                            <Text
                              className={`text-sm ${
                                step.id === "extracting"
                                || step.id === "generating"
                                  ? "text-zinc-300"
                                  : "text-zinc-500"
                              }`}
                            >
                              {step.text}
                            </Text>
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
                        <Text className="text-sm font-medium text-zinc-300">
                          AI-Generated Summary
                        </Text>
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
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="px-6 py-16 md:px-12 bg-zinc-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <Title
                level={2}
                className="text-!white text-!3xl md:text-!4xl"
              >
                Trusted by{" "}
                <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  10,000+
                </span>{" "}
                Content Professionals
              </Title>
              <Paragraph className="text-!zinc-300 text-!lg max-w-2xl mx-auto">
                Join researchers, creators, and strategists who are saving hours
                every week with VISPARK
              </Paragraph>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <Card
                  key={`testimonial-${testimonial.name}`}
                  className="bg-white/5 backdrop-blur-sm border-white/10 h-full"
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
                  <Paragraph className="text-!zinc-300 mb-!4 italic">
                    "{testimonial.content}"
                  </Paragraph>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <Text className="block font-medium text-white">
                        {testimonial.name}
                      </Text>
                      <Text className="text-sm text-zinc-400">
                        {testimonial.role}, {testimonial.company}
                      </Text>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-16 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <Title
                level={2}
                className="text-!white text-!3xl md:text-!4xl"
              >
                Powerful Features for{" "}
                <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Content Intelligence
                </span>
              </Title>
              <Paragraph className="text-!zinc-300 text-!lg max-w-2xl mx-auto">
                Everything you need to extract maximum value from video content
              </Paragraph>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card
                  key={`feature-${feature.title}`}
                  className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group"
                >
                  <div
                    className={`h-12 w-12 rounded-lg bg-linear-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon
                      size={24}
                      className="text-white"
                    />
                  </div>
                  <Title
                    level={4}
                    className="text-!white mb-!2"
                  >
                    {feature.title}
                  </Title>
                  <Paragraph className="text-!zinc-300 mb-!0">
                    {feature.description}
                  </Paragraph>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="px-6 py-16 md:px-12 bg-zinc-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <Title
                level={2}
                className="text-!white text-!3xl md:text-!4xl"
              >
                See How It{" "}
                <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Works
                </span>
              </Title>
              <Paragraph className="text-!zinc-300 text-!lg max-w-2xl mx-auto">
                Transform any YouTube video into actionable insights in three
                simple steps
              </Paragraph>
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
                    <Title
                      level={4}
                      className="text-!white"
                    >
                      {step.title}
                    </Title>
                    <Paragraph className="text-!zinc-300">
                      {step.description}
                    </Paragraph>
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
              <Title
                level={2}
                className="text-!white text-!3xl md:text-!4xl"
              >
                Simple, Transparent{" "}
                <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Pricing
                </span>
              </Title>
              <Paragraph className="text-!zinc-300 text-!lg max-w-2xl mx-auto">
                Choose the plan that works best for your content analysis needs
              </Paragraph>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingTiers.map((tier) => (
                <Card
                  key={`tier-${tier.name}`}
                  className={`bg-white/5 backdrop-blur-sm border ${
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
                      <Title
                        level={3}
                        className="text-!white mb-!1"
                      >
                        {tier.name}
                      </Title>
                      <Text className="text-zinc-400 text-sm">
                        {tier.description}
                      </Text>
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
                          <Text className="text-zinc-300 text-sm">
                            {feature}
                          </Text>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/signup"
                      className={`w-full block px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                        tier.popular
                          ? "bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white shadow-lg"
                          : "border border-white/20 hover:border-white/40 hover:bg-white/5 text-white"
                      }`}
                    >
                      {tier.cta}
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 md:px-12 bg-linear-to-r from-blue-900/20 to-purple-900/20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Title
              level={2}
              className="text-!white text-!3xl md:text-!4xl"
            >
              Ready to Transform Your{" "}
              <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Content Workflow
              </span>
              ?
            </Title>
            <Paragraph className="text-!zinc-300 text-!lg">
              Join thousands of professionals who are saving hours every week
              with VISPARK
            </Paragraph>
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
                <SparkleIcon
                  className="text-blue-400"
                  size={24}
                  weight="fill"
                />
                <span className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  VISPARK
                </span>
              </div>
              <Paragraph className="text-!zinc-400 text-sm mb-!0">
                Transform YouTube content into actionable insights with
                AI-powered analysis.
              </Paragraph>
            </div>

            <div>
              <Title
                level={5}
                className="text-!white mb-!4"
              >
                Product
              </Title>
              <div className="space-y-2">
                <Link
                  to="/features"
                  className="block text-sm text-zinc-400 hover:text-white transition"
                >
                  Features
                </Link>
                <Link
                  to="/pricing"
                  className="block text-sm text-zinc-400 hover:text-white transition"
                >
                  Pricing
                </Link>
                <Link
                  to="/api"
                  className="block text-sm text-zinc-400 hover:text-white transition"
                >
                  API
                </Link>
              </div>
            </div>

            <div>
              <Title
                level={5}
                className="text-!white mb-!4"
              >
                Company
              </Title>
              <div className="space-y-2">
                <Link
                  to="/about"
                  className="block text-sm text-zinc-400 hover:text-white transition"
                >
                  About
                </Link>
                <Link
                  to="/blog"
                  className="block text-sm text-zinc-400 hover:text-white transition"
                >
                  Blog
                </Link>
                <Link
                  to="/contact"
                  className="block text-sm text-zinc-400 hover:text-white transition"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10 text-zinc-400 text-sm">
            <span>
              &copy; {new Date().getFullYear()} VISPARK. All rights reserved.
            </span>
            <div className="flex gap-6">
              <Link
                to="/privacy"
                className="hover:text-white transition"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="hover:text-white transition"
              >
                Terms
              </Link>
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
