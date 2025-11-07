import { useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { getBestThumbnailUrl } from "@/services/vispark.ts"
import { useVisparksWithMetadata } from "@/hooks/useVisparks"

type ChannelGroupEntry = {
  id: string
  videoId: string
  videoTitle: string
  channelTitle: string
  channelId: string
  createdTime: string
  thumbnailUrl: string
}

type ChannelGroup = {
  channelTitle: string
  channelId: string
  entries: ChannelGroupEntry[]
}

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
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { visparks, isLoading, error } = useVisparksWithMetadata(200)

  // Group visparks by channel
  const groups = useMemo(() => {
    const groupedMap = new Map<string, ChannelGroup>()

    for (const vispark of visparks) {
      const channelTitle = vispark.metadata.channelTitle
      const existing = groupedMap.get(channelTitle)

      if (existing) {
        existing.entries.push({
          id: vispark.id,
          videoId: vispark.videoId,
          videoTitle: vispark.metadata.title,
          channelTitle: vispark.metadata.channelTitle,
          channelId: vispark.metadata.channelId,
          createdTime: vispark.createdTime,
          thumbnailUrl: getBestThumbnailUrl(vispark.metadata.thumbnails) || fallbackThumbnailUrl(vispark.videoId),
        })
      } else {
        groupedMap.set(channelTitle, {
          channelTitle: vispark.metadata.channelTitle,
          channelId: vispark.metadata.channelId,
          entries: [{
            id: vispark.id,
            videoId: vispark.videoId,
            videoTitle: vispark.metadata.title,
            channelTitle: vispark.metadata.channelTitle,
            channelId: vispark.metadata.channelId,
            createdTime: vispark.createdTime,
            thumbnailUrl: getBestThumbnailUrl(vispark.metadata.thumbnails) || fallbackThumbnailUrl(vispark.videoId),
          }],
        })
      }
    }

    // Sort entries within each group by creation time (newest first)
    for (const group of groupedMap.values()) {
      group.entries.sort((a, b) =>
        new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
      )
    }

    // Sort groups by latest entry time
    return Array.from(groupedMap.values()).sort((a, b) => {
      const latestA = new Date(a.entries[0]?.createdTime ?? 0).getTime()
      const latestB = new Date(b.entries[0]?.createdTime ?? 0).getTime()
      return latestB - latestA
    })
  }, [visparks])

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

  const status = isLoading ? "loading" : error ? "error" : "success"
  const errorMessage = error instanceof Error ? error.message : null

  return (
    <div className="relative h-full overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute -top-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/25 blur-3xl" />
      <div className="pointer-events-none absolute top-20 left-[-12%] h-96 w-96 rounded-full bg-blue-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-18%] right-[-8%] h-96 w-96 rounded-full bg-emerald-500/20 blur-[140px]" />

      <div className="relative z-10 mx-auto h-full w-full max-w-7xl overflow-y-auto px-4 py-10 pb-20 sm:px-6 lg:px-10">
        <header className="mb-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.45em] text-indigo-200/80">
              {t("summaries.visparkArchive")}
            </p>
            <h1 className="text-4xl font-black text-white sm:text-5xl lg:text-6xl">
              {t("summaries.title")}
            </h1>
            <p className="max-w-2xl text-base text-gray-300/90 sm:text-lg">
              {t("summaries.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-200/80">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {t("summaries.savedVideos", { count: stats.totalVideos })}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              {t("summaries.channels", { count: stats.totalChannels })}
            </span>
            {stats.latestSavedIso && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                {t("summaries.updated", { time: formatRelativeToNow(stats.latestSavedIso) })}
              </span>
            )}
          </div>
        </header>

        {status === "loading" && <LoadingSkeleton />}

        {status === "error" && (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-center text-red-200 backdrop-blur-md">
            <h2 className="text-lg font-semibold">{t("summaries.unableToLoad")}</h2>
            <p className="mt-2 text-sm text-red-200/80">{errorMessage}</p>
          </div>
        )}

        {status === "success" && groups.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-14 text-center text-gray-300 backdrop-blur-md">
            <h2 className="text-2xl font-semibold text-white">
              {t("summaries.noVisparks")}
            </h2>
            <p className="mt-3 text-sm text-gray-300/80">
              {t("summaries.noVisparksDescription")}
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
                  <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.75)] backdrop-blur-xl">
                    <div
                      className={`pointer-events-none absolute -top-1/3 right-[-8%] h-full w-3/5 bg-linear-to-br ${accent} opacity-60 blur-3xl`}
                    />
                    <div className="relative space-y-6 p-6 sm:p-8">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-gray-200/70">
                            {t("summaries.channel")}
                          </p>
                          <button
                            type="button"
                            onClick={() => navigate({ to: `/app/channels/${group.channelId}` })}
                            className="mt-1 text-2xl font-semibold text-white sm:text-3xl hover:text-indigo-300 transition-colors duration-200 text-left"
                          >
                            {group.channelTitle}
                          </button>
                          <p className="text-sm text-gray-200/80">
                            {t("summaries.saved", {
                              count: group.entries.length,
                              type: group.entries.length === 1 ? t("summaries.video") : t("summaries.videos")
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {group.entries.map((entry) => (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() =>
                              navigate({ to: `/app/videos/${entry.videoId}` })
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
                                {t("summaries.savedTime", { time: formatAbsoluteDate(entry.createdTime) })}
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
