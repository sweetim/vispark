import { BellIcon, CheckFatIcon } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import useYoutubeSearch from "@/hooks/useYoutubeSearch"

const SearchPage = () => {
  const [channelId, setChannelId] = useState("")
  const { data: youtubeSearchData, setQuery } = useYoutubeSearch()

  const navigate = useNavigate()

  const STORAGE_KEY = "subscribedChannels"

  const getSubscribed = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Array<{
        id: string
        name?: string
        avatar?: string
      }>
    } catch {
      return []
    }
  }

  const isSubscribed = (id?: string) => {
    if (!id) return false
    return getSubscribed().some((c) => c.id === id)
  }

  const handleSubscribe = (
    id: string | undefined,
    name?: string,
    avatar?: string,
  ) => {
    if (!id) return
    try {
      const list = getSubscribed()
      if (!list.some((c) => c.id === id)) {
        list.push({ id, name: name ?? "", avatar: avatar ?? "" })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      }
      // After successful subscribe, go to channels page
      navigate("/app/channel")
    } catch {
      // ignore storage errors for now
      navigate("/app/channel")
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!channelId) return

    setQuery(channelId)
  }

  // allow Enter key to submit from the input (prevents form double-submit issues)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (!channelId) return

      setQuery(channelId)
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gray-900 text-white p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mb-10"
        >
          <input
            type="text"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. UC_x5XG1OV2P6uZZ5FSM9Ttw"
            className="px-4 py-3 border rounded-lg bg-gray-900 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </form>

        <div className="w-full max-w-md">
          <h2 className="text-md mb-2">
            {youtubeSearchData.length > 0
              ? `Found ${youtubeSearchData.length} channels`
              : "No results"}
          </h2>

          <ul className="space-y-4">
            {youtubeSearchData.map((item) => {
              const channelIdFromItem =
                item.id?.channelId
                ?? (item.snippet as unknown as { channelId?: string })
                  ?.channelId
              const avatar = item.snippet?.thumbnails?.medium?.url
              const title = item.snippet?.channelTitle
              const subscribed = isSubscribed(channelIdFromItem)

              return (
                <li
                  key={item.etag}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md"
                >
                  <div className="flex items-center">
                    <img
                      src={avatar}
                      alt={title}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <span className="font-semibold text-lg">{title}</span>
                  </div>
                  <div>
                    {subscribed ? (
                      <button
                        type="button"
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full flex items-center justify-center w-10 h-10"
                        aria-label="Subscribed"
                        title="Subscribed"
                        aria-pressed="true"
                      >
                        <CheckFatIcon weight="fill" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleSubscribe(channelIdFromItem, title, avatar)
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full flex items-center justify-center w-10 h-10"
                        aria-label="Subscribe"
                        title="Subscribe"
                      >
                        <BellIcon />
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SearchPage
