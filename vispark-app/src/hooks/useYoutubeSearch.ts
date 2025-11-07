import { useCallback, useEffect, useRef, useState } from "react"
import { supabase } from "@/config/supabaseClient.ts"

type Thumbnail = {
  url: string
}

type Thumbnails = {
  default: Thumbnail
  medium: Thumbnail
  high: Thumbnail
}

type YouTubeSnippet = {
  channelId: string
  channelTitle: string
  description: string
  liveBroadcastContent: string
  publishTime: string
  publishedAt: string
  thumbnails: Thumbnails
  title: string
}

export type YouTubeSearchResult = {
  etag: string
  id: {
    kind: string
    channelId: string
  }
  kind: string
  snippet: YouTubeSnippet
}

export default function useYoutubeSearch() {
  const [query, setQuery] = useState<string>("")
  const [data, setData] = useState<YouTubeSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async (query: string) => {
    if (!query) {
      setData([])
      setError(null)
      setLoading(false)
      return
    }

    // Cancel previous
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.functions.invoke<{
        items: YouTubeSearchResult[]
      }>("youtube-search", {
        body: { query, type: "channel" },
      })

      if (error) {
        throw new Error(
          error.message ?? "Failed to search channels. Please try again.",
        )
      }

      if (!data?.items) {
        throw new Error("Unexpected response format from search service.")
      }

      setData(data.items)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return // expected on cancel
      setError(err instanceof Error ? err : new Error(String(err)))
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(query)
    return () => controllerRef.current?.abort()
  }, [query, fetchData])

  const refetch = useCallback(() => fetchData(query), [query, fetchData])

  return { data, loading, error, setQuery, refetch } as const
}
