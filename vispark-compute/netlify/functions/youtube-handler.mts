import type { Context } from "@netlify/functions"

type ChallengeUrl = {
  challenge: string | null
  mode: string | null
  topic: string | null
  leaseSeconds: string | null
}

type Account = {
  id: string
}

type Deploy = {
  context: string
  id: string
  published: boolean
}

type Country = {
  code: string
  name: string
}

type Subdivision = {
  code: string
  name: string
}

type Geo = {
  country: Country
  subdivision: Subdivision
  timezone: string
  latitude: number
  longitude: number
}

type Server = {
  region: string
}

type Site = {
  id: string
  name: string
  url: string
}

type WebhookPayload = {
  account: Account
  cookies: Record<string, unknown>
  deploy: Deploy
  flags: Record<string, unknown>
  geo: Geo
  ip: string
  params: Record<string, unknown>
  requestId: string
  server: Server
  site: Site
  url: string
}

function parseWebhookPayload(input: string): ChallengeUrl {
  const url = new URL(input)

  return {
    challenge: url.searchParams.get("hub.challenge"),
    mode: url.searchParams.get("hub.mode"),
    topic: url.searchParams.get("hub.topic"),
    leaseSeconds: url.searchParams.get("hub.lease_seconds"),
  }
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it("parseHubChallenge from URL string", async () => {
    const input =
      "https://vispark.netlify.app/.netlify/functions/youtube-handler?hub.topic=https://www.youtube.com/feeds/videos.xml%3Fchannel_id%3DUCnMn36GT_H0X-w5_ckLtlgQ&hub.challenge=18272998144577416615&hub.mode=subscribe&hub.lease_seconds=432000"

    const actual = parseWebhookPayload(input)
    const expected = {
      challenge: "18272998144577416615",
      mode: "subscribe",
      topic:
        "https://www.youtube.com/feeds/videos.xml?channel_id=UCnMn36GT_H0X-w5_ckLtlgQ",
      leaseSeconds: "432000",
    }

    expect(actual).toStrictEqual(expected)
  })
}

export default async (req: Request, context: Context) => {
  console.log(req.body)
  console.log(JSON.stringify(context, null, 2))
  const body: WebhookPayload = await req.json()

  const { challenge } = parseWebhookPayload(body.url)

  return new Response(challenge, {
    status: 200,
    headers: {
      "content-type": "text/plain",
    },
  })
}
