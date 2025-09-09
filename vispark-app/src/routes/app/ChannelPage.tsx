import { BellIcon, CheckFatIcon } from "@phosphor-icons/react"
import { useCallback, useEffect, useState } from "react"
import useYoutubeSearch from "@/hooks/useYoutubeSearch"

const STORAGE_KEY = "subscribedChannels"

const ChannelPage = () => {
  const [subscribedChannels, setSubscribedChannels] = useState<
    Array<{ id: string; name?: string; avatar?: string }>
  >([])

  const loadSubscriptions = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return setSubscribedChannels([])
      const parsed = JSON.parse(raw)
      setSubscribedChannels(Array.isArray(parsed) ? parsed : [])
    } catch (_err) {
      setSubscribedChannels([])
    }
  }, [])

  useEffect(() => {
    loadSubscriptions()
  }, [loadSubscriptions])

  // Search hook
  const { data: youtubeSearchData, setQuery } = useYoutubeSearch()
  const [searchInput, setSearchInput] = useState("")

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

  const handleSubscribe = async (
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

      // Attempt to subscribe to PubSubHubbub (best-effort)
      try {
        const params = new URLSearchParams({
          "hub.callback":
            "https://vispark.netlify.app/.netlify/functions/youtube-handler",
          "hub.topic": `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`,
          "hub.verify": "async",
          "hub.mode": "subscribe",
          "hub.verify_token": "",
          "hub.secret": "",
          "hub.lease_seconds": "",
        })

        await fetch("https://pubsubhubbub.appspot.com/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        })
      } catch {
        // ignore network errors for pubsub subscribe
      }

      // Refresh displayed subscribed channels
      loadSubscriptions()
    } catch {
      // ignore storage errors
      loadSubscriptions()
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!searchInput) return
    setQuery(searchInput)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (!searchInput) return
      setQuery(searchInput)
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gray-900 text-white p-4">
      <div className="w-full max-w-md">
        <header style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Subscribed channels</h2>
        </header>

        {/* Search area */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 my-4"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search YouTube channels"
            className="px-4 py-3 border rounded-lg bg-gray-900 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </form>

        {/* Search results */}
        {youtubeSearchData.length > 0 && (
          <div className="w-full mb-6">
            <h3 className="text-md mb-2">
              {youtubeSearchData.length > 0
                ? `Found ${youtubeSearchData.length} channels`
                : "No results"}
            </h3>

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
        )}

        {/* Subscribed list */}
        {subscribedChannels.length === 0 ? (
          <p>No subscribed channels found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {subscribedChannels.map((ch) => (
              <li
                key={ch.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 0",
                }}
              >
                {ch.avatar ? (
                  <img
                    src={ch.avatar}
                    alt={ch.name ?? ch.id}
                    width={48}
                    height={48}
                    style={{ borderRadius: 8, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      background: "#eee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#666",
                      fontSize: 12,
                    }}
                  >
                    {ch.name ? ch.name[0].toUpperCase() : "?"}
                  </div>
                )}

                <div>
                  <div style={{ fontWeight: 600 }}>
                    {ch.name ?? "(no name)"}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>{ch.id}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ChannelPage
