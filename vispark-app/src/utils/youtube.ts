/**
 * Extracts YouTube video ID from various YouTube URL formats
 * @param url The YouTube URL or video ID
 * @returns The video ID if found, null otherwise
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url || typeof url !== "string") {
    return null;
  }

  // If it's already a video ID (11 characters), return it
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim();
  }

  try {
    const urlObj = new URL(url);

    // Handle youtu.be short URLs
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1);
    }

    // Handle youtube.com URLs
    if (urlObj.hostname.includes("youtube.com")) {
      // Check for video ID in 'v' parameter
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        return videoId;
      }

      // Handle embed URLs
      if (urlObj.pathname.includes("/embed/")) {
        const parts = urlObj.pathname.split("/embed/");
        if (parts.length > 1) {
          return parts[1].split("?")[0];
        }
      }

      // Handle short URLs
      if (urlObj.pathname.includes("/shorts/")) {
        const parts = urlObj.pathname.split("/shorts/");
        if (parts.length > 1) {
          return parts[1].split("?")[0];
        }
      }
    }

    return null;
  } catch {
    // If URL parsing fails, return null
    return null;
  }
};
