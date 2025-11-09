import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useTranscriptLanguageStore } from "@/stores/transcriptLanguageStore"
import { GlobeIcon } from "@phosphor-icons/react"
import { ToggleSwitch } from "@/components/ToggleSwitch"

const VisparkPage = () => {
  const { t } = useTranslation()
  const { transcriptLanguage, setTranscriptLanguage } = useTranscriptLanguageStore()
  const [autoGenerateSummary, setAutoGenerateSummary] = useState(true)
  const [detectTrends, setDetectTrends] = useState(true)
  const [extractKeyTopics, setExtractKeyTopics] = useState(false)

  const handleTranscriptLanguageChange = (language: string) => {
    setTranscriptLanguage(language)
  }

  return (
    <div className="relative h-full">
      <div className="pointer-events-none absolute -top-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/25 blur-3xl" />
      <div className="pointer-events-none absolute top-20 left-[-12%] h-96 w-96 rounded-full bg-blue-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-18%] right-[-8%] h-96 w-96 rounded-full bg-emerald-500/20 blur-[140px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-10">
        <div className="space-y-6">
          {/* Transcript Language Settings */}
          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.75)] backdrop-blur-xl">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <GlobeIcon size={20} weight="duotone" />
                {t("settings.transcriptLanguage")}
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-300 mb-4">
                  {t("settings.transcriptLanguageDescription")}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleTranscriptLanguageChange("en")}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    transcriptLanguage === "en"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  {t("settings.english")}
                </button>
                <button
                  type="button"
                  onClick={() => handleTranscriptLanguageChange("ja")}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    transcriptLanguage === "ja"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  {t("settings.japanese")}
                </button>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300">
                  {t("settings.transcriptLanguageNote")}
                </p>
              </div>
            </div>
          </div>

          {/* VISPARK Processing Settings */}
          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.75)] backdrop-blur-xl">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-medium text-white">{t("settings.processingSettings")}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white">{t("settings.autoGenerateSummary")}</h3>
                  <p className="text-sm text-gray-400">Automatically generate summaries when processing videos</p>
                </div>
                <div className="flex-shrink-0 pt-1">
                  <ToggleSwitch
                    isOn={autoGenerateSummary}
                    onToggle={() => setAutoGenerateSummary(!autoGenerateSummary)}
                  />
                </div>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white">{t("settings.detectTrends")}</h3>
                  <p className="text-sm text-gray-400">Identify trends and patterns across multiple videos</p>
                </div>
                <div className="flex-shrink-0 pt-1">
                  <ToggleSwitch
                    isOn={detectTrends}
                    onToggle={() => setDetectTrends(!detectTrends)}
                  />
                </div>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white">{t("settings.extractKeyTopics")}</h3>
                  <p className="text-sm text-gray-400">Extract and categorize key topics from transcripts</p>
                </div>
                <div className="flex-shrink-0 pt-1">
                  <ToggleSwitch
                    isOn={extractKeyTopics}
                    onToggle={() => setExtractKeyTopics(!extractKeyTopics)}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default VisparkPage
