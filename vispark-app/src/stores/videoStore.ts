import { create } from "zustand"
import type { VideoMetadata } from "@/services/vispark"

export type Step = "idle" | "gathering" | "summarizing" | "complete" | "error"
export type ErrorStep = "gathering" | "summarizing" | null
export type ViewMode = "summary" | "transcript"

type VideoState = {
  loading: boolean
  transcript: string
  summary: string[] | null
  error: string | null
  step: Step
  errorStep: ErrorStep
  view: ViewMode
  userViewPreference: ViewMode | null
  videoMetadata: VideoMetadata | null
}

type VideoActions = {
  resetState: (existingVispark?: any) => void
  setLoading: (loading: boolean) => void
  setTranscript: (transcript: string) => void
  setSummary: (summary: string[] | null) => void
  setError: (error: string, errorStep: ErrorStep) => void
  setStep: (step: Step) => void
  setView: (view: ViewMode) => void
  setUserViewPreference: (preference: ViewMode | null) => void
  setVideoMetadata: (metadata: VideoMetadata | null) => void
}

const initialState: VideoState = {
  loading: false,
  transcript: "",
  summary: null,
  error: null,
  step: "idle",
  errorStep: null,
  view: "transcript",
  userViewPreference: null,
  videoMetadata: null,
}

export const useVideoStore = create<VideoState & VideoActions>((set) => ({
  ...initialState,

  resetState: (existingVispark) =>
    set({
      ...initialState,
      summary: existingVispark?.summaries ?? null,
      view:
        existingVispark && existingVispark.summaries.length > 0
          ? "summary"
          : "transcript",
      videoMetadata: existingVispark?.metadata ?? null,
    }),

  setLoading: (loading) => set({ loading }),

  setTranscript: (transcript) => set({ transcript }),

  setSummary: (summary) => set({ summary }),

  setError: (error, errorStep) =>
    set({
      error,
      errorStep,
      step: "error",
    }),

  setStep: (step) => set({ step }),

  setView: (view) => set({ view }),

  setUserViewPreference: (userViewPreference) => set({ userViewPreference }),

  setVideoMetadata: (videoMetadata) => set({ videoMetadata }),
}))
