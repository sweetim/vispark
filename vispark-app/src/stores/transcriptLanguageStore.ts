import { create } from "zustand"
import { persist } from "zustand/middleware"

type TranscriptLanguageState = {
  transcriptLanguage: string
  setTranscriptLanguage: (language: string) => void
}

export const useTranscriptLanguageStore = create<TranscriptLanguageState>()(
  persist(
    (set) => ({
      transcriptLanguage: "en", // Default to English
      setTranscriptLanguage: (language: string) =>
        set({ transcriptLanguage: language }),
    }),
    {
      name: "vispark-transcript-language",
    },
  ),
)
