import { create } from "zustand"
import type { VideoMetadata } from "@/services/vispark"
import {
  fetchSummaryStream,
  fetchTranscript,
  formatTranscript,
  saveVispark,
} from "@/services/vispark"

export type Step = "idle" | "gathering" | "summarizing" | "complete" | "error"
export type ErrorStep = "gathering" | "summarizing" | null
export type ViewMode = "summary" | "transcript"

type Notification = {
  message: string
  type: "success" | "error" | "info" | "warning"
  videoId?: string
  videoMetadata?: {
    title?: string
    channelTitle?: string
    channelId?: string
    thumbnail?: string
  }
} | null

type VideoState = {
  // Background processing state
  processingVideoId: string | null
  status: Step
  errorStep: ErrorStep
  error: string | null
  transcript: string
  summary: string | null
  streamingSummary: string
  notification: Notification

  // UI state
  view: ViewMode
  userViewPreference: ViewMode | null
  videoMetadata: VideoMetadata | null
}

type VideoActions = {
  startProcessing: (videoId: string, metadata: VideoMetadata) => Promise<void>
  cancelProcessing: () => void
  setNotification: (notification: Notification) => void
  clearNotification: () => void

  // UI Actions
  setView: (view: ViewMode) => void
  setUserViewPreference: (preference: ViewMode | null) => void
  setVideoMetadata: (metadata: VideoMetadata | null) => void
  resetState: () => void
}

const initialState: VideoState = {
  processingVideoId: null,
  status: "idle",
  errorStep: null,
  error: null,
  transcript: "",
  summary: null,
  streamingSummary: "",
  notification: null,
  view: "summary",
  userViewPreference: null,
  videoMetadata: null,
}

export const useVideoStore = create<VideoState & VideoActions>((set, get) => {
  let abortController: AbortController | null = null

  return {
    ...initialState,

    startProcessing: async (videoId, metadata) => {
      const state = get()
      if (
        state.processingVideoId === videoId
        && state.status !== "error"
        && state.status !== "idle"
      ) {
        return // Already processing this video
      }

      // Reset for new processing
      set({
        processingVideoId: videoId,
        status: "gathering",
        error: null,
        errorStep: null,
        transcript: "",
        summary: null,
        streamingSummary: "",
        videoMetadata: metadata,
      })

      abortController = new AbortController()

      try {
        // 1. Fetch Transcript
        const transcriptResult = await fetchTranscript({
          videoId,
          lang: metadata.defaultLanguage,
        })

        const formattedTranscript = formatTranscript(
          transcriptResult.transcript,
        )
        set({ transcript: formattedTranscript })

        // 2. Generate Summary
        set({ status: "summarizing" })

        const stream = await fetchSummaryStream(transcriptResult.transcript)
        const reader = stream.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let summaryText = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine) continue

            try {
              const parsed = JSON.parse(trimmedLine)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                summaryText += content
                set((s) => ({ streamingSummary: s.streamingSummary + content }))
              }

              if (parsed.choices?.[0]?.finish_reason === "stop") {
                // Save to DB
                await saveVispark(
                  videoId,
                  metadata.channelId,
                  summaryText,
                  metadata,
                )

                set({
                  status: "complete",
                  summary: summaryText,
                  notification: {
                    message: "Summary generated successfully!",
                    type: "success",
                    videoId: videoId,
                    videoMetadata: {
                      title: metadata.title,
                      channelTitle: metadata.channelTitle,
                      channelId: metadata.channelId,
                      thumbnail: metadata.thumbnails,
                    },
                  },
                })
                return
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      } catch (error) {
        console.error("Processing failed:", error)
        const currentStatus = get().status
        set({
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
          errorStep:
            currentStatus === "gathering" ? "gathering" : "summarizing",
          notification: { message: "Failed to process video.", type: "error" },
        })
      } finally {
        abortController = null
      }
    },

    cancelProcessing: () => {
      if (abortController) {
        abortController.abort()
        abortController = null
      }
      set({
        status: "idle",
        processingVideoId: null,
        streamingSummary: "",
      })
    },

    setNotification: (notification) => set({ notification }),
    clearNotification: () => set({ notification: null }),

    setView: (view) => set({ view }),
    setUserViewPreference: (userViewPreference) => set({ userViewPreference }),
    setVideoMetadata: (videoMetadata) => set({ videoMetadata }),
    resetState: () => set(initialState),
  }
})
