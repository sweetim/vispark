import { type FormEvent, useId, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Outlet } from "@tanstack/react-router"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"

const SearchLayout = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const reactId = useId()
  const inputId = useMemo(() => `channel-search-${reactId}`, [reactId])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) {
      return
    }

    // Navigate to search route with query parameter
    navigate({
      to: "/app/channels/search",
      search: { q: trimmedQuery }
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto h-full space-y-2 overflow-y-auto pb-20">
      <div className="absolute inset-0 pattern-bg -z-10"></div>

      {/* Header Section with Search Input */}
      <div className="sticky top-0 z-10 animate-slideInFromTop">
        <div className="glass-effect rounded-2xl p-6 shadow-2xl border border-white/10">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {t("channels.discoverChannels")}
                </h1>
                <p className="text-gray-400 text-sm">
                  {t("channels.exploreSubscribe")}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-label={t("channels.search")}
          >
            <div className="relative group">
              <input
                id={inputId}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("channels.searchPlaceholder")}
                className="w-full pl-4 pr-32 py-4 glass-effect rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-300 text-lg shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-4 z-10"
                aria-label={t("channels.search")}
                disabled={!searchQuery.trim()}
              >
                <div className="p-2 rounded-lg bg-linear-to-br from-indigo-500/20 to-purple-500/20 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                  <MagnifyingGlassIcon className="h-5 w-5 text-indigo-300" />
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Outlet for nested routes */}
      <Outlet />
    </div>
  )
}

export default SearchLayout
