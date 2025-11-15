import { useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { ChartBarIcon } from "@phosphor-icons/react"
import CountBadge from "@/components/CountBadge"
import { useVisparks } from "@/hooks/useVisparks"

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
  <div className="flex h-full w-full flex-col">
    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {skeletonPlaceholders.map((placeholderKey) => (
        <div
          key={placeholderKey}
          className="flex items-center gap-3 rounded-lg border border-white/10 bg-gray-900/50 p-3 backdrop-blur"
        >
          <div className="w-24 h-14 rounded bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

const SummariesPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { visparks, isLoading, error } = useVisparks()

  // Group visparks by channel
  const groups = useMemo(() => {
    const groupedMap = new Map<string, ChannelGroup>()

    for (const item of visparks) {
      const channelTitle = item.video_channel_title
      const existing = groupedMap.get(channelTitle)

      if (existing) {
        existing.entries.push({
          id: item.id,
          videoId: item.video_id,
          videoTitle: item.video_title,
          channelTitle: item.video_channel_title,
          channelId: item.video_channel_id,
          createdTime: item.created_at,
          thumbnailUrl: item.video_thumbnails,
        })
      } else {
        groupedMap.set(channelTitle, {
          channelTitle: item.video_channel_title,
          channelId: item.video_channel_id,
          entries: [{
            id: item.id,
            videoId: item.video_id,
            videoTitle: item.video_title,
            channelTitle: item.video_channel_title,
            channelId: item.video_channel_id,
            createdTime: item.created_at,
            thumbnailUrl: item.video_thumbnails,
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

    let latestVideoUploadedIso: string | null = null
    for (const entry of allEntries) {
      // Use publishedAt if available, otherwise fall back to createdTime
      const dateToUse = entry.createdTime

      const date = new Date(dateToUse)
      if (Number.isNaN(date.getTime())) {
        continue
      }

      if (!latestVideoUploadedIso) {
        latestVideoUploadedIso = dateToUse
        continue
      }

      if (new Date(latestVideoUploadedIso).getTime() < date.getTime()) {
        latestVideoUploadedIso = dateToUse
      }
    }

    return {
      totalVideos,
      totalChannels: groups.length,
      latestVideoUploadedIso,
    }
  }, [groups, visparks])

  const status = isLoading ? "loading" : error ? "error" : "success"
  const errorMessage = error instanceof Error ? error.message : null

  return (
    <div className="relative h-full overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute -top-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/25 blur-3xl" />
      <div className="pointer-events-none absolute top-20 left-[-12%] h-96 w-96 rounded-full bg-blue-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-18%] right-[-8%] h-96 w-96 rounded-full bg-emerald-500/20 blur-[140px]" />

      <div className="relative z-10 mx-auto h-full w-full max-w-7xl overflow-y-auto px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white sm:text-4xl">
            <ChartBarIcon size={32} className="text-indigo-400" />
            {t("summaries.title")}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <CountBadge variant="gray" count={stats.totalVideos}>
              {stats.totalVideos} videos
            </CountBadge>
            <CountBadge variant="gray" count={stats.totalChannels}>
              {stats.totalChannels} channels
            </CountBadge>
            {stats.latestVideoUploadedIso && (
              <CountBadge variant="gray" count={0}>
                Updated {formatRelativeToNow(stats.latestVideoUploadedIso)}
              </CountBadge>
            )}
          </div>
        </header>

        {status === "loading" && <LoadingSkeleton />}

        {status === "error" && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-6 py-8 text-center text-red-200 backdrop-blur-md">
            <h2 className="text-lg font-semibold">{t("summaries.unableToLoad")}</h2>
            <p className="mt-2 text-sm text-red-200/80">{errorMessage}</p>
          </div>
        )}

        {status === "success" && groups.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/15 bg-white/5 px-6 py-14 text-center text-gray-300 backdrop-blur-md">
            <h2 className="text-xl font-semibold text-white">
              {t("summaries.noVisparks")}
            </h2>
            <p className="mt-3 text-sm text-gray-300/80">
              {t("summaries.noVisparksDescription")}
            </p>
          </div>
        )}

        {status === "success" && groups.length > 0 && (
          <div className="space-y-2">
            {groups.map((group, index) => {
              const accent = gradientPalette[index % gradientPalette.length]

              return (
                <section key={group.channelTitle}>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                    <div
                      className={`pointer-events-none absolute -top-1/3 right-[-8%] h-full w-3/5 bg-linear-to-br ${accent} opacity-30 blur-3xl`}
                    />
                    <div className="relative p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => navigate({ to: `/app/channels/${group.channelId}` })}
                          className="text-xl font-semibold text-white hover:text-indigo-300 transition-colors"
                        >
                          {group.channelTitle}
                        </button>
                        <CountBadge count={group.entries.length} />
                      </div>

                      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                        {group.entries.map((entry) => (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() =>
                              navigate({ to: `/app/videos/${entry.videoId}` })
                            }
                            className="group flex items-center gap-3 rounded-lg border border-white/10 bg-gray-900/50 p-3 text-left backdrop-blur transition hover:bg-gray-800/50 hover:border-white/20"
                          >
                            <div className="relative w-24 shrink-0 overflow-hidden rounded">
                              <img
                                src={entry.thumbnailUrl}
                                alt={entry.videoTitle}
                                loading="lazy"
                                className="aspect-video w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-medium text-white">
                                {entry.videoTitle}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatRelativeToNow(entry.createdTime)}
                              </p>
                            </div>
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
