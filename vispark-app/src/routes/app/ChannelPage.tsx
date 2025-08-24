import { useCallback, useEffect, useState } from "react"

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

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gray-900 text-white p-4">
      <div className="w-full max-w-md">
        <header style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Subscribed channels</h2>
        </header>
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
