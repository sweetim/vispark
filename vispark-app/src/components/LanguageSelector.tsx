type LanguageSelectorProps = {
  currentLanguage: string
  onLanguageChange: (language: string) => void
  englishLabel: string
  japaneseLabel: string
}

const LanguageSelector = ({
  currentLanguage,
  onLanguageChange,
  englishLabel,
  japaneseLabel,
}: LanguageSelectorProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onLanguageChange("en")}
        className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
          currentLanguage === "en"
            ? "bg-indigo-600 text-white"
            : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
        }`}
      >
        {englishLabel}
      </button>
      <button
        type="button"
        onClick={() => onLanguageChange("ja")}
        className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
          currentLanguage === "ja"
            ? "bg-indigo-600 text-white"
            : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
        }`}
      >
        {japaneseLabel}
      </button>
    </div>
  )
}

export default LanguageSelector
