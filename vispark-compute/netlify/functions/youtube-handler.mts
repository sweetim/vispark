import type { Context } from "@netlify/functions"
import { match } from "ts-pattern"
import { parseYoutubeFeeds } from "../../src/youtube-notification-parser.js"

type ChallengeUrl = {
  challenge: string | null
  mode: string | null
  topic: string | null
  leaseSeconds: string | null
}

function parseWebhookPayload(url: URL): ChallengeUrl {
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
    const input = new URL(
      "https://vispark.netlify.app/.netlify/functions/youtube-handler?hub.topic=https://www.youtube.com/feeds/videos.xml%3Fchannel_id%3DUCnMn36GT_H0X-w5_ckLtlgQ&hub.challenge=18272998144577416615&hub.mode=subscribe&hub.lease_seconds=432000",
    )

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
  return match(context.url.searchParams.size)
    .with(0, async () => {
      const bodyText = await req.text()
      const feed = parseYoutubeFeeds(bodyText)
      console.log(feed)
      return new Response(null, {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    })
    .otherwise(() => {
      const { challenge } = parseWebhookPayload(context.url)

      return new Response(challenge, {
        status: 200,
        headers: {
          "content-type": "text/plain",
        },
      })
    })
}
