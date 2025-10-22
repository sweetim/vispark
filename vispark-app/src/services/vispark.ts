import { supabase } from "@/config/supabaseClient.ts"

export type TranscriptSegment = {
  text: string
  offset?: number
  duration?: number
}

export type TranscriptResult = {
  videoId: string
  transcript: TranscriptSegment[]
  lang?: string
}

export type SummaryResult = {
  bullets: string[]
}

export const fetchTranscript = async (
  videoId: string,
): Promise<TranscriptResult> => {
  const { data, error } =
    await supabase.functions.invoke<TranscriptResult>("transcript", {
      body: { videoId },
    })

  if (error) {
    throw new Error(error.message ?? "Failed to fetch transcript. Please try again.")
  }

  if (!data) {
    throw new Error("Unexpected response format from transcript service.")
  }

  return data
}

export const fetchSummary = async (
  transcripts: TranscriptSegment[],
): Promise<SummaryResult> => {
  const { data: summaryData, error } =
    await supabase.functions.invoke<SummaryResult>("summary", {
      body: { transcripts },
    })

  if (error) {
    throw new Error(error.message ?? "Failed to fetch summary. Please try again.")
  }

  if (!summaryData) {
    throw new Error("Unexpected response format from summary service.")
  }

  return summaryData
}

export const formatTranscript = (segments: TranscriptSegment[]): string =>
  segments
    .map(({ text }) => text.trim())
    .filter((segment) => segment.length > 0)
    .join("\n")
