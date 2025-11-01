import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders: Record<string, string> = {
  "Content-Type": "application/json",
};

const buildHeaders = (): HeadersInit => ({
  ...corsHeaders,
  ...jsonHeaders,
});

type ChannelRequestPayload = {
  channelId: string;
  action:
    | "getDetails"
    | "getVideosWithSummaries"
    | "updateInfo"
    | "subscribe"
    | "unsubscribe"
    | "checkSubscription";
};

type ChannelMetadata = {
  channelId: string;
  channelTitle: string;
  channelThumbnailUrl: string;
  videoCount: number;
};

type ChannelVideo = {
  videoId: string;
  title: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
  publishedAt: string;
  hasSummary: boolean;
};

type ChannelSuccessResponse = {
  channel?: ChannelMetadata;
  videos?: ChannelVideo[];
  message?: string;
  isSubscribed?: boolean;
};

type ChannelErrorResponse = {
  error: string;
  message: string;
};

type ResponseBody = ChannelSuccessResponse | ChannelErrorResponse;

const respondWith = (body: ResponseBody, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: buildHeaders(),
  });

// Fetch channel details from YouTube API
const fetchChannelFromYouTube = async (
  channelId: string,
  apiKey: string,
): Promise<ChannelMetadata> => {
  console.log(`Fetching channel ${channelId} from YouTube API`);
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "snippet,statistics");
  url.searchParams.set("id", channelId);
  url.searchParams.set("key", apiKey);

  console.log(`YouTube API URL: ${url.toString()}`);

  const response = await fetch(url.toString());
  console.log(`YouTube API response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`YouTube API error response: ${errorText}`);
    throw new Error(
      `YouTube API error: ${response.status} ${response.statusText}`,
    );
  }

  const json = await response.json();
  console.log(`YouTube API response:`, json);

  const item = json?.items?.[0];
  if (!item?.snippet) {
    console.error(`Channel not found for ID: ${channelId}`);
    throw new Error("Channel not found for the provided channel ID.");
  }

  const { title, thumbnails } = item.snippet as {
    title: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };

  const videoCount = item.statistics?.videoCount
    ? parseInt(item.statistics.videoCount, 10)
    : 0;

  const channelData = {
    channelId,
    channelTitle: title,
    channelThumbnailUrl: thumbnails.medium?.url ?? thumbnails.default?.url ??
      "",
    videoCount,
  };

  console.log(`Processed channel data:`, channelData);
  return channelData;
};

// Get videos from channel that have summaries
const getChannelVideosWithSummaries = async (
  supabase: any,
  channelId: string,
  apiKey: string,
): Promise<ChannelVideo[]> => {
  // First get all videos from the channel
  const videosUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  videosUrl.searchParams.set("part", "snippet");
  videosUrl.searchParams.set("channelId", channelId);
  videosUrl.searchParams.set("type", "video");
  videosUrl.searchParams.set("order", "date");
  videosUrl.searchParams.set("maxResults", "50");
  videosUrl.searchParams.set("key", apiKey);

  const videosResponse = await fetch(videosUrl.toString());
  if (!videosResponse.ok) {
    throw new Error(
      `YouTube API error: ${videosResponse.status} ${videosResponse.statusText}`,
    );
  }

  const videosJson = await videosResponse.json();
  const videoItems = videosJson?.items ?? [];

  if (videoItems.length === 0) {
    return [];
  }

  // Get video IDs
  const videoIds = videoItems.map((item: any) => item.id.videoId).filter(
    Boolean,
  );

  // Check which videos have summaries in the visparks table
  const { data: visparksData } = await supabase
    .from("visparks")
    .select("video_id")
    .in("video_id", videoIds);

  const videosWithSummaries = new Set(
    visparksData?.map((v: any) => v.video_id) ?? [],
  );

  // Map to ChannelVideo format
  return videoItems
    .filter((item: any) =>
      item.id?.videoId && videosWithSummaries.has(item.id.videoId)
    )
    .map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnails: item.snippet.thumbnails,
      publishedAt: item.snippet.publishedAt,
      hasSummary: true,
    }));
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return respondWith(
      {
        error: "Method Not Allowed",
        message: "Only POST is supported.",
      },
      405,
    );
  }

  // Parse and validate payload
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return respondWith(
      {
        error: "Invalid JSON",
        message: "Request body must be valid JSON.",
      },
      400,
    );
  }

  const { channelId, action } = (payload ?? {}) as Partial<
    ChannelRequestPayload
  >;

  if (typeof channelId !== "string" || channelId.trim().length === 0) {
    return respondWith(
      {
        error: "Missing fields",
        message: "The request body must include a non-empty channelId.",
      },
      400,
    );
  }

  if (
    !action ||
    ![
      "getDetails",
      "getVideosWithSummaries",
      "updateInfo",
      "subscribe",
      "unsubscribe",
      "checkSubscription",
    ].includes(action)
  ) {
    return respondWith(
      {
        error: "Invalid action",
        message:
          "Action must be one of: getDetails, getVideosWithSummaries, updateInfo, subscribe, unsubscribe, checkSubscription.",
      },
      400,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return respondWith(
      {
        error: "Server misconfiguration",
        message:
          "SUPABASE_URL or SUPABASE_ANON_KEY is not set. Configure them in your environment before calling this function.",
      },
      500,
    );
  }

  if (!youtubeApiKey) {
    return respondWith(
      {
        error: "Server misconfiguration",
        message:
          "YOUTUBE_API_KEY is not set. Configure it in your environment before calling this function.",
      },
      500,
    );
  }

  // Forward the caller's JWT so RLS applies
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    console.log(
      `Processing request for action: ${action}, channelId: ${channelId}`,
    );

    switch (action) {
      case "getDetails": {
        console.log(`Fetching channel ${channelId} from YouTube API`);
        // Always fetch from YouTube API since we removed these fields from the database
        const channelData = await fetchChannelFromYouTube(
          channelId,
          youtubeApiKey,
        );
        console.log(`Successfully fetched channel data:`, channelData);

        return respondWith({ channel: channelData }, 200);
      }

      case "getVideosWithSummaries": {
        const videos = await getChannelVideosWithSummaries(
          supabase,
          channelId,
          youtubeApiKey,
        );
        return respondWith({ videos }, 200);
      }

      case "updateInfo": {
        // This action is no longer needed since we always fetch from YouTube API
        return respondWith({
          message:
            "This action is deprecated. Channel info is always fetched from YouTube API.",
        }, 200);
      }

      case "subscribe": {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return respondWith({
            error: "Unauthorized",
            message: "You must be logged in to subscribe to channels.",
          }, 401);
        }

        // Add subscription
        const { error } = await supabase
          .from("channels")
          .upsert({
            channel_id: channelId,
            user_id: user.id,
          });

        if (error) {
          return respondWith({
            error: "Subscription failed",
            message: error.message,
          }, 400);
        }

        return respondWith({ message: "Subscribed successfully" }, 200);
      }

      case "unsubscribe": {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return respondWith({
            error: "Unauthorized",
            message: "You must be logged in to unsubscribe from channels.",
          }, 401);
        }

        // Remove subscription
        const { error } = await supabase
          .from("channels")
          .delete()
          .eq("channel_id", channelId)
          .eq("user_id", user.id);

        if (error) {
          return respondWith({
            error: "Unsubscribe failed",
            message: error.message,
          }, 400);
        }

        return respondWith({ message: "Unsubscribed successfully" }, 200);
      }

      case "checkSubscription": {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return respondWith({ isSubscribed: false }, 200);
        }

        // Check if subscription exists
        const { data, error } = await supabase
          .from("channels")
          .select("id")
          .eq("channel_id", channelId)
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") { // PGRST116 is "not found" error
          return respondWith({
            error: "Check subscription failed",
            message: error.message,
          }, 400);
        }

        return respondWith({ isSubscribed: !!data }, 200);
      }

      default:
        return respondWith(
          {
            error: "Invalid action",
            message: "Action not implemented.",
          },
          400,
        );
    }
  } catch (error) {
    console.error("Channel function error:", error);
    return respondWith(
      {
        error: "Internal Server Error",
        message: error instanceof Error
          ? error.message
          : "An unknown error occurred.",
      },
      500,
    );
  }
});
