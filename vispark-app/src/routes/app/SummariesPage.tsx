import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import {
  fetchYouTubeVideoDetails,
  getBestThumbnailUrl,
  listVisparks,
} from "@/services/vispark.ts"

type ChannelGroupEntry = {
  id: string
  videoId: string
  videoTitle: string
  channelTitle: string
  createdTime: string
  thumbnailUrl: string
}

type ChannelGroup = {
  channelTitle: string
  entries: ChannelGroupEntry[]
}

type FetchStatus = "idle" | "loading" | "success" | "error"

const gradientPalette = [
  "from-indigo-500/40 via-purple-500/25 to-pink-500/30",
  "from-sky-500/40 via-cyan-500/25 to-emerald-500/30",
  "from-amber-500/35 via-orange-500/25 to-rose-500/35",
  "from-fuchsia-500/35 via-purple-500/25 to-blue-500/30",
  "from-lime-500/35 via-emerald-500/25 to-teal-500/30",
] as const

const fallbackThumbnailUrl = (videoId: string): string =>
  `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`

const formatAbsoluteDate = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return "Unknown date"
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

const formatRelativeToNow = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return "Unknown time"
  }

  const diff = date.getTime() - Date.now()
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
    ["second", 1000],
  ]

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  for (const [unit, ms] of units) {
    const value = diff / ms
    if (Math.abs(value) >= 1) {
      return formatter.format(Math.round(value), unit)
    }
  }

  return formatter.format(Math.round(diff / 1000), "second")
}

const skeletonPlaceholders = [
  "placeholder-a",
  "placeholder-b",
  "placeholder-c",
  "placeholder-d",
  "placeholder-e",
  "placeholder-f",
] as const

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
    {skeletonPlaceholders.map((placeholderKey) => (
      <div
        key={placeholderKey}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
      >
        <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="h-24 w-32 rounded-xl bg-white/10" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-3/4 rounded-full bg-white/10" />
            <div className="h-3 w-1/2 rounded-full bg-white/5" />
            <div className="h-3 w-2/3 rounded-full bg-white/5" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

const SummariesPage = () => {
  const [groups, setGroups] = useState<ChannelGroup[]>([])
  const [status, setStatus] = useState<FetchStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const allEntries = groups.flatMap((group) => group.entries)
    const totalVideos = allEntries.length

    let latestSavedIso: string | null = null
    for (const entry of allEntries) {
      const date = new Date(entry.createdTime)
      if (Number.isNaN(date.getTime())) {
        continue
      }

      if (!latestSavedIso) {
        latestSavedIso = entry.createdTime
        continue
      }

      if (new Date(latestSavedIso).getTime() < date.getTime()) {
        latestSavedIso = entry.createdTime
      }
    }

    return {
      totalVideos,
      totalChannels: groups.length,
      latestSavedIso,
    }
  }, [groups])

  useEffect(() => {
    let cancelled = false

    const loadSummaries = async () => {
      setStatus("loading")
      setErrorMessage(null)

      try {
        const rows = await listVisparks(200)

        if (cancelled) {
          return
        }

        if (rows.length === 0) {
          setGroups([])
          setStatus("success")
          return
        }

        const metadataCache = new Map<
          string,
          Awaited<ReturnType<typeof fetchYouTubeVideoDetails>>
        >()

        const entries = await Promise.all(
          rows.map(async (row) => {
            if (cancelled) {
              return null
            }

            let metadata = metadataCache.get(row.video_id) ?? null

            if (!metadata) {
              try {
                metadata = await fetchYouTubeVideoDetails(row.video_id)
                metadataCache.set(row.video_id, metadata)
              } catch (metadataError) {
                if (import.meta.env.DEV && metadataError) {
                  console.warn(
                    "Failed to fetch YouTube metadata:",
                    metadataError,
                  )
                }
              }
            }

            const thumbnailUrl = metadata?.thumbnails
              ? getBestThumbnailUrl(metadata.thumbnails)
              : fallbackThumbnailUrl(row.video_id)

            return {
              id: row.id,
              videoId: row.video_id,
              videoTitle: metadata?.title ?? `Video ${row.video_id}`,
              channelTitle: metadata?.channelTitle?.trim() ?? "Unknown Channel",
              createdTime: row.created_at,
              thumbnailUrl: thumbnailUrl || fallbackThumbnailUrl(row.video_id),
            } satisfies ChannelGroupEntry
          }),
        )

        if (cancelled) {
          return
        }

        const filteredEntries = entries.filter(
          (entry): entry is ChannelGroupEntry => entry !== null,
        )

        const groupedMap = new Map<string, ChannelGroup>()

        for (const entry of filteredEntries) {
          const existing = groupedMap.get(entry.channelTitle)

          if (existing) {
            existing.entries.push(entry)
          } else {
            groupedMap.set(entry.channelTitle, {
              channelTitle: entry.channelTitle,
              entries: [entry],
            })
          }
        }

        const grouped = Array.from(groupedMap.values()).map((group) => ({
          ...group,
          entries: group.entries.sort(
            (a, b) =>
              new Date(b.createdTime).getTime()
              - new Date(a.createdTime).getTime(),
          ),
        }))

        const sortedGroups = grouped.sort((a, b) => {
          const latestA = new Date(a.entries[0]?.createdTime ?? 0).getTime()
          const latestB = new Date(b.entries[0]?.createdTime ?? 0).getTime()
          return latestB - latestA
        })

        setGroups(sortedGroups)
        setStatus("success")
      } catch (error) {
        if (cancelled) {
          return
        }

        setStatus("error")
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load vispark summaries. Please try again.",
        )
      }
    }

    void loadSummaries()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute -top-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/25 blur-3xl" />
      <div className="pointer-events-none absolute top-20 left-[-12%] h-96 w-96 rounded-full bg-blue-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-18%] right-[-8%] h-96 w-96 rounded-full bg-emerald-500/20 blur-[140px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <header className="mb-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.45em] text-indigo-200/80">
              Vispark Archive
            </p>
            <h1 className="text-4xl font-black text-white sm:text-5xl lg:text-6xl">
              Fast channel overview for every vispark.
            </h1>
            <p className="max-w-2xl text-base text-gray-300/90 sm:text-lg">
              Scan the creators you have summarized and jump straight back into
              any video with one click.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-200/80">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {stats.totalVideos} saved videos
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              {stats.totalChannels} channels
            </span>
            {stats.latestSavedIso && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Updated {formatRelativeToNow(stats.latestSavedIso)}
              </span>
            )}
          </div>
        </header>

        {status === "loading" && <LoadingSkeleton />}

        {status === "error" && (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-center text-red-200 backdrop-blur-md">
            <h2 className="text-lg font-semibold">Unable to load visparks</h2>
            <p className="mt-2 text-sm text-red-200/80">{errorMessage}</p>
          </div>
        )}

        {status === "success" && groups.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-14 text-center text-gray-300 backdrop-blur-md">
            <h2 className="text-2xl font-semibold text-white">
              No visparks yet
            </h2>
            <p className="mt-3 text-sm text-gray-300/80">
              Generate a summary in Vispark and it will appear here, grouped by
              the channel it came from.
            </p>
          </div>
        )}

        {status === "success" && groups.length > 0 && (
          <div className="space-y-10">
            {groups.map((group, index) => {
              const accent = gradientPalette[index % gradientPalette.length]

              return (
                <section
                  key={group.channelTitle}
                  className="relative"
                >
                  <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.75)] backdrop-blur-xl">
                    <div
                      className={`pointer-events-none absolute -top-1/3 right-[-8%] h-full w-3/5 bg-gradient-to-br ${accent} opacity-60 blur-3xl`}
                    />
                    <div className="relative space-y-6 p-6 sm:p-8">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-gray-200/70">
                            Channel
                          </p>
                          <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
                            {group.channelTitle}
                          </h2>
                          <p className="text-sm text-gray-200/80">
                            {group.entries.length} saved{" "}
                            {group.entries.length === 1 ? "video" : "videos"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {group.entries.map((entry) => (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() =>
                              navigate(`/app/vispark/search/${entry.videoId}`)
                            }
                            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-gray-900/70 p-4 text-left shadow-[0_12px_40px_-20px_rgba(15,23,42,0.9)] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:shadow-[0_28px_70px_-40px_rgba(129,140,248,0.55)]"
                          >
                            <div className="relative w-36 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                              <img
                                src={entry.thumbnailUrl}
                                alt={entry.videoTitle}
                                loading="lazy"
                                className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                              <span className="pointer-events-none absolute bottom-2 left-2 rounded-full border border-white/10 bg-black/60 px-2 py-1 text-[0.6rem] uppercase tracking-[0.25em] text-indigo-200/80 shadow">
                                {formatRelativeToNow(entry.createdTime)}
                              </span>
                            </div>

                            <div className="flex flex-1 flex-col gap-2">
                              <p className="line-clamp-2 text-sm font-semibold text-white md:text-base">
                                {entry.videoTitle}
                              </p>
                              <div className="text-xs text-gray-400">
                                Saved {formatAbsoluteDate(entry.createdTime)}
                              </div>
                            </div>

                            <span className="hidden text-lg font-semibold text-indigo-200 transition duration-200 group-hover:translate-x-1 group-hover:text-white xl:inline">
                              →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SummariesPage
