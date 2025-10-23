import { supabase } from "@/config/supabaseClient.ts";

export type TranscriptSegment = {
  text: string;
  offset?: number;
  duration?: number;
};

export type TranscriptResult = {
  videoId: string;
  transcript: TranscriptSegment[];
  lang?: string;
};

export type SummaryResult = {
  bullets: string[];
};

export const fetchTranscript = async (
  videoId: string,
): Promise<TranscriptResult> => {
  const { data, error } = await supabase.functions.invoke<TranscriptResult>(
    "transcript",
    {
      body: { videoId },
    },
  );

  if (error) {
    throw new Error(
      error.message ?? "Failed to fetch transcript. Please try again.",
    );
  }

  if (!data) {
    throw new Error("Unexpected response format from transcript service.");
  }

  return data;
};

export const fetchSummary = async (
  transcripts: TranscriptSegment[],
): Promise<SummaryResult> => {
  const { data: summaryData, error } = await supabase.functions.invoke<
    SummaryResult
  >("summary", {
    body: { transcripts },
  });

  if (error) {
    throw new Error(
      error.message ?? "Failed to fetch summary. Please try again.",
    );
  }

  if (!summaryData) {
    throw new Error("Unexpected response format from summary service.");
  }

  return summaryData;
};

export const formatTranscript = (segments: TranscriptSegment[]): string =>
  segments
    .map(({ text }) => text.trim())
    .filter((segment) => segment.length > 0)
    .join("\n");

// YouTube Video Metadata (no abbreviations in identifiers)
type YouTubeThumbnail = {
  url: string;
};

type YouTubeThumbnails = {
  default: YouTubeThumbnail;
  medium: YouTubeThumbnail;
  high: YouTubeThumbnail;
};

export type VideoMetadata = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnails: YouTubeThumbnails;
};

export const getBestThumbnailUrl = (thumbnails?: YouTubeThumbnails): string =>
  thumbnails?.high?.url ?? thumbnails?.medium?.url ??
    thumbnails?.default?.url ?? "";

/**
 * Fetch video metadata (title, channel name, thumbnails) from the YouTube Data Service.
 * Requires VITE_YOUTUBE_API_KEY in your environment.
 */
export const fetchYouTubeVideoDetails = async (
  videoId: string,
): Promise<VideoMetadata> => {
  const youTubeApplicationProgrammingInterfaceKey =
    import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!youTubeApplicationProgrammingInterfaceKey) {
    throw new Error(
      "VITE_YOUTUBE_API_KEY is not set. Add it to your .env file to enable video metadata retrieval.",
    );
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("id", videoId);
  url.searchParams.set(
    "key",
    youTubeApplicationProgrammingInterfaceKey as string,
  );

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(
      `YouTube service error: ${response.status} ${response.statusText}`,
    );
  }

  const json = await response.json();
  const item = json?.items?.[0];
  if (!item?.snippet) {
    throw new Error("Video was not found for the provided video identifier.");
  }

  const { title, channelTitle, thumbnails } = item.snippet as {
    title: string;
    channelTitle: string;
    thumbnails: YouTubeThumbnails;
  };

  return {
    videoId,
    title,
    channelTitle,
    thumbnails,
  };
};

export type SaveVisparkResult = {
  id: string;
  videoId: string;
  summaries: string[];
  createdTime: string;
};

/**
 * Persist a user's vispark entry (videoId + summaries).
 * Uses the authenticated session via supabase.functions.invoke.
 */
export const saveVispark = async (
  videoId: string,
  summaries: string[],
): Promise<SaveVisparkResult> => {
  // Ensure Authorization header is forwarded to the Edge Function
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token;
  if (!accessToken) {
    throw new Error("You must be signed in to save a vispark.");
  }

  const { data, error } = await supabase.functions.invoke<SaveVisparkResult>(
    "vispark",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      body: { videoId, summaries },
    },
  );

  if (error) {
    throw new Error(
      error.message ?? "Failed to save vispark. Please try again.",
    );
  }

  if (!data) {
    throw new Error("Unexpected response format from vispark service.");
  }

  return data;
};

export type VisparkRow = {
  id: string;
  video_id: string;
  summaries: string[];
  created_at: string;
};

/**
 * List the authenticated user's visparks (latest first).
 * Requires RLS policy allowing select of rows where user_id = auth.uid().
 */
export const listVisparks = async (limit = 10): Promise<VisparkRow[]> => {
  const { data, error } = await supabase
    .from("visparks")
    .select("id, video_id, summaries, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(
      error.message ?? "Failed to list visparks. Please try again.",
    );
  }

  return (data ?? []) as VisparkRow[];
};
