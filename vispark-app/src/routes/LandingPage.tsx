import { ArrowRightIcon } from "@phosphor-icons/react"
import { Button, Card, Col, Row, Typography } from "antd"
import type { FC } from "react"
import { Link } from "react-router"

const { Title, Paragraph, Text } = Typography

const LandingPage: FC = () => {
  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      <header className="px-6 py-6 md:px-12">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            VISPARK
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 transition"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 transition text-white"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 pt-8 pb-24 md:px-12">
        <section className="max-w-5xl mx-auto text-center md:text-left">
          <div className="flex flex-col-reverse md:flex-row items-center gap-10">
            <div className="flex-1 space-y-6">
              <Title className="!text-4xl md:!text-5xl !text-white !leading-tight">
                Harness AI to transform YouTube videos into actionable insights
              </Title>
              <Paragraph className="!text-lg md:!text-xl !text-zinc-300">
                VISPARK surfaces summaries, takes, and trends from the creators
                you follow—so you can stay ahead without watching every upload.
              </Paragraph>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-400 transition text-white font-medium"
                >
                  Start your free account
                  <ArrowRightIcon size={20} weight="bold" />
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-lg border border-white/20 hover:border-white/40 transition text-white font-medium text-center"
                >
                  Log in to VISPARK
                </Link>
              </div>
              <Text className="block text-sm text-zinc-400">
                No payment required. Confirm your email to unlock personalized
                feeds.
              </Text>
            </div>
            <Card
              className="flex-1 w-full max-w-xl bg-white/5 backdrop-blur-md border-white/10"
              bordered={false}
            >
              <div className="space-y-4">
                <Title level={4} className="!text-white !mb-2">
                  Why creators rely on VISPARK
                </Title>
                <Paragraph className="!text-zinc-300">
                  Instantly summarize long-form content, extract channel
                  highlights, and generate shareable insights with our AI
                  summaries pipeline.
                </Paragraph>
                <ul className="space-y-3 text-left">
                  <li className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-semibold">
                      1
                    </div>
                    <div>
                      <Text className="block font-medium text-white">
                        Search smarter
                      </Text>
                      <Text className="block text-zinc-400">
                        Deep semantic search across video transcripts to find
                        what matters.
                      </Text>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-semibold">
                      2
                    </div>
                    <div>
                      <Text className="block font-medium text-white">
                        Summaries on demand
                      </Text>
                      <Text className="block text-zinc-400">
                        Condensed key points delivered instantly for faster
                        decision-making.
                      </Text>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-semibold">
                      3
                    </div>
                    <div>
                      <Text className="block font-medium text-white">
                        Stay ahead
                      </Text>
                      <Text className="block text-zinc-400">
                        Personalized feeds track the voices you care about—no
                        extra effort.
                      </Text>
                    </div>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </section>

        <section className="max-w-6xl mx-auto mt-24">
          <Title
            level={3}
            className="!text-white !text-center md:!text-left md:!text-3xl"
          >
            Built for content strategists, researchers, and creators
          </Title>
          <Row gutter={[24, 24]} className="mt-10">
            {[
              {
                title: "Summaries that stick",
                description:
                  "Extract meaningful takeaways from hours of video content within seconds.",
              },
              {
                title: "Channel intelligence",
                description:
                  "Track trends, themes, and new ideas across the channels you monitor.",
              },
              {
                title: "AI copilots",
                description:
                  "Leverage AI assistance to generate briefs, scripts, and talking points.",
              },
            ].map((feature) => (
              <Col xs={24} md={8} key={feature.title}>
                <Card className="h-full bg-white/10 border-white/10 text-white">
                  <Title level={4} className="!text-white">
                    {feature.title}
                  </Title>
                  <Paragraph className="!text-zinc-300">
                    {feature.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      </main>

      <footer className="px-6 py-12 md:px-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-400 text-sm">
          <span>&copy; {new Date().getFullYear()} VISPARK. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-white transition">
              Log in
            </Link>
            <Link to="/signup" className="hover:text-white transition">
              Sign up
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
      </footer>
    </div>
  )
}

export default LandingPage
