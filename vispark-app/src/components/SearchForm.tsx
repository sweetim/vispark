import { type FormEvent, useId, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { SparkleIcon } from "@phosphor-icons/react"

type SearchFormProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

const SearchForm = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled = false
}: SearchFormProps) => {
  const { t } = useTranslation()
  const reactId = useId()
  const inputId = useMemo(() => `search-input-${reactId}`, [reactId])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (value.trim()) {
      onSubmit(value.trim())
    }
  }

  return (
    <div className="sticky top-0 z-50 bg-gray-900 py-2 backdrop-blur-sm bg-opacity-95 border-b border-gray-800">
      <form
        onSubmit={handleSubmit}
        className="space-y-2"
        aria-label={t("videos.search")}
      >
        <div className="flex">
          <input
            id={inputId}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder || t("videos.searchPlaceholder")}
            className="flex-1 px-3 py-2 rounded-l-md bg-gray-800 border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-r-md text-white disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label={t("videos.search")}
            disabled={disabled || !value.trim()}
          >
            <SparkleIcon size={20} weight="fill" className="text-white" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default SearchForm
