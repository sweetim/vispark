import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useTranscriptLanguageStore } from "@/stores/transcriptLanguageStore"
import { GlobeIcon } from "@phosphor-icons/react"
import { BackgroundDecoration, SettingsSection, ToggleOption, LanguageSelector } from "@/components"

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
      <BackgroundDecoration />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-10">
        <div className="space-y-6">
          {/* Transcript Language Settings */}
          <SettingsSection
            title={t("settings.transcriptLanguage")}
            icon={<GlobeIcon size={20} weight="duotone" />}
          >
            <div className="mb-4">
              <p className="text-sm text-gray-300 mb-4">
                {t("settings.transcriptLanguageDescription")}
              </p>
            </div>
            <LanguageSelector
              currentLanguage={transcriptLanguage}
              onLanguageChange={handleTranscriptLanguageChange}
              englishLabel={t("settings.english")}
              japaneseLabel={t("settings.japanese")}
            />
            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-300">
                {t("settings.transcriptLanguageNote")}
              </p>
            </div>
          </SettingsSection>

          {/* VISPARK Processing Settings */}
          <SettingsSection title={t("settings.processingSettings")}>
            <div className="space-y-4">
              <ToggleOption
                title={t("settings.autoGenerateSummary")}
                description="Automatically generate summaries when processing videos"
                isOn={autoGenerateSummary}
                onToggle={() => setAutoGenerateSummary(!autoGenerateSummary)}
              />
              <ToggleOption
                title={t("settings.detectTrends")}
                description="Identify trends and patterns across multiple videos"
                isOn={detectTrends}
                onToggle={() => setDetectTrends(!detectTrends)}
              />
              <ToggleOption
                title={t("settings.extractKeyTopics")}
                description="Extract and categorize key topics from transcripts"
                isOn={extractKeyTopics}
                onToggle={() => setExtractKeyTopics(!extractKeyTopics)}
              />
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  )
}

export default VisparkPage
