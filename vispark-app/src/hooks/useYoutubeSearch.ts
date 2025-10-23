import { useCallback, useEffect, useRef, useState } from "react";

type Thumbnail = {
  url: string;
};

type Thumbnails = {
  default: Thumbnail;
  medium: Thumbnail;
  high: Thumbnail;
};

type YouTubeSnippet = {
  channelId: string;
  channelTitle: string;
  description: string;
  liveBroadcastContent: string;
  publishTime: string;
  publishedAt: string;
  thumbnails: Thumbnails;
  title: string;
};

export type YouTubeSearchResult = {
  etag: string;
  id: {
    kind: string;
    channelId: string;
  };
  kind: string;
  snippet: YouTubeSnippet;
};

export default function useYoutubeSearch() {
  const [query, setQuery] = useState<string>("");
  const [data, setData] = useState<YouTubeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Read API key from Vite env. Must be defined as VITE_YT_API_KEY.
  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!YOUTUBE_API_KEY) {
    // Defer throwing until fetch to allow SSR/initialization; but warn in dev
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "VITE_YOUTUBE_API_KEY is not set. You must add it to your .env for YouTube requests to work.",
      );
    }
  }

  const fetchData = useCallback(async (query: string) => {
    if (!query) {
      setData([]);
      setError(null);
      setLoading(false);
      return;
    }

    // Cancel previous
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const url = new URL("https://www.googleapis.com/youtube/v3/search");
      url.searchParams.set("part", "snippet");
      url.searchParams.set("q", query);
      url.searchParams.set("type", "channel");
      url.searchParams.set("key", YOUTUBE_API_KEY!);

      const res = await fetch(url.toString(), { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const json = await res.json();
      setData(json.items ?? []);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return; // expected on cancel
      setError(err instanceof Error ? err : new Error(String(err)));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(query);
    return () => controllerRef.current?.abort();
  }, [query, fetchData]);

  const refetch = useCallback(() => fetchData(query), [query, fetchData]);

  return { data, loading, error, setQuery, refetch } as const;
}
