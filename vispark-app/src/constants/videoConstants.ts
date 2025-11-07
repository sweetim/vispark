// Retry configuration
export const RETRY_CONFIG = {
  TRANSCRIPT: {
    maxRetries: 2,
    baseDelay: 500,
  },
  METADATA: {
    maxRetries: 2,
    baseDelay: 500,
  },
  SUMMARY: {
    maxRetries: 3,
    baseDelay: 1000,
  },
} as const

// Error messages
export const ERROR_MESSAGES = {
  TRANSCRIPT_FAILED:
    "An unexpected error occurred while fetching the transcript.",
  SUMMARY_FAILED: "An unexpected error occurred while generating the summary.",
  UNEXPECTED_ERROR: "An unexpected error occurred.",
} as const

// Development warnings
export const DEV_WARNINGS = {
  METADATA_FAILED: "Failed to fetch YouTube video metadata:",
  VISPARK_SAVE_FAILED: "Failed to save vispark:",
  MISSING_CHANNEL_ID:
    "Skipping vispark save due to missing channel ID. Video ID:",
} as const

// View modes
export const VIEW_MODES = {
  SUMMARY: "summary" as const,
  TRANSCRIPT: "transcript" as const,
} as const

// Processing steps
export const PROCESSING_STEPS = {
  IDLE: "idle" as const,
  GATHERING: "gathering" as const,
  SUMMARIZING: "summarizing" as const,
  COMPLETE: "complete" as const,
  ERROR: "error" as const,
} as const

// Error steps
export const ERROR_STEPS = {
  GATHERING: "gathering" as const,
  SUMMARIZING: "summarizing" as const,
} as const
