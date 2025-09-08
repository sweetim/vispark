import { parseFeed } from "feedsmith"

export type YouTubeFeed = {
  links: FeedLink[]
  title: string
  updated: string
  entries: YouTubeEntry
}

export type YouTubeEntry = {
  authors: {
    name: string
    uri: string
  }[]
  id: string
  links: FeedLink[]
  published: string
  title: string
  updated: string
}

export type FeedLink = {
  href: string
  rel: string
}

export const parseYoutubeFeeds = (input: string): YouTubeFeed => {
  const { feed } = parseFeed(input)
  return feed as YouTubeFeed
}
