import { parseFeed } from "feedsmith"

export type YouTubeFeed = {
  authors: YouTubeAuthor[]
  id: string
  links: FeedLink[]
  title: string
  updated: string
  entries: YouTubeEntry
}

export type YouTubeAuthor = {
  name: string
  uri: string
}

export type YouTubeEntry = {
  authors: YouTubeAuthor[]
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
