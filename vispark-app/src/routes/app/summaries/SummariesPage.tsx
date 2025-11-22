import { useMemo, useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ChartBarIcon } from "@phosphor-icons/react"
import { formatDistanceToNow } from "date-fns"
import { CountBadge, LoadingSkeleton, ChannelGroup, type ChannelGroupEntry } from "@/components"
import { useVisparks } from "@/hooks/useVisparks"
import { useVideoStore } from "@/stores/videoStore"

const gradientPalette = [
  "from-indigo-500/40 via-purple-500/25 to-pink-500/30",
  "from-sky-500/40 via-cyan-500/25 to-emerald-500/30",
  "from-amber-500/35 via-orange-500/25 to-rose-500/35",
  "from-fuchsia-500/35 via-purple-500/25 to-blue-500/30",
  "from-lime-500/35 via-emerald-500/25 to-teal-500/30",
] as const


const SummariesPage = () => {
  const { t } = useTranslation()
  const { visparks, isLoading, error, mutate: mutateVisparks } = useVisparks()
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set())
  const { processingVideoId, status, videoMetadata } = useVideoStore()

  // Group visparks by channel
  const groups = useMemo(() => {
    const groupedMap = new Map<string, {
      channelTitle: string
      channelId: string
      entries: ChannelGroupEntry[]
    }>()

    // Add existing visparks
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

    // Add currently processing video if it's not already in the list
    if (processingVideoId && status !== "idle" && status !== "complete" && videoMetadata) {
      const channelTitle = videoMetadata.channelTitle
      const existing = groupedMap.get(channelTitle)

      const processingEntry: ChannelGroupEntry = {
        id: `processing-${processingVideoId}`,
        videoId: processingVideoId,
        videoTitle: videoMetadata.title,
        channelTitle: videoMetadata.channelTitle,
        channelId: videoMetadata.channelId,
        createdTime: new Date().toISOString(),
        thumbnailUrl: videoMetadata.thumbnails,
      }

      if (existing) {
        existing.entries.push(processingEntry)
      } else {
        groupedMap.set(channelTitle, {
          channelTitle: videoMetadata.channelTitle,
          channelId: videoMetadata.channelId,
          entries: [processingEntry],
        })
      }
    }

    // Sort entries within each group by creation time (newest first)
    for (const group of groupedMap.values()) {
      group.entries.sort((a: ChannelGroupEntry, b: ChannelGroupEntry) =>
        new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
      )
    }

    // Sort groups by latest entry time
    return Array.from(groupedMap.values()).sort((a, b) => {
      const latestA = new Date(a.entries[0]?.createdTime ?? 0).getTime()
      const latestB = new Date(b.entries[0]?.createdTime ?? 0).getTime()
      return latestB - latestA
    })
  }, [visparks, processingVideoId, status, videoMetadata])

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

  const toggleChannelExpansion = (channelId: string) => {
    setExpandedChannels((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(channelId)) {
        newSet.delete(channelId)
      } else {
        newSet.add(channelId)
      }
      return newSet
    })
  }

  // Listen for video processing completion and revalidate visparks data
  useEffect(() => {
    if (status === "complete") {
      // Revalidate the visparks data to show the new video
      mutateVisparks()
    }
  }, [status, mutateVisparks])

  // Revalidate visparks data when component mounts or gains focus
  useEffect(() => {
    const handleFocus = () => {
      mutateVisparks()
    }

    // Add focus event listener to refresh data when user returns to the page
    window.addEventListener('focus', handleFocus)

    // Also revalidate on mount
    mutateVisparks()

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [mutateVisparks])

  const pageStatus = isLoading ? "loading" : error ? "error" : "success"
  const errorMessage = error instanceof Error ? error.message : null

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute -top-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/25 blur-3xl" />
      <div className="pointer-events-none absolute top-20 left-[-12%] h-96 w-96 rounded-full bg-blue-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-18%] right-[-8%] h-96 w-96 rounded-full bg-emerald-500/20 blur-[140px]" />

      <div className="relative z-10 mx-auto h-full w-full max-w-7xl overflow-y-auto px-2 py-8 sm:px-6">
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
                Updated {formatDistanceToNow(new Date(stats.latestVideoUploadedIso), { addSuffix: true })}
              </CountBadge>
            )}
          </div>
        </header>

        {pageStatus === "loading" && <LoadingSkeleton />}

        {pageStatus === "error" && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-6 py-8 text-center text-red-200 backdrop-blur-md">
            <h2 className="text-lg font-semibold">{t("summaries.unableToLoad")}</h2>
            <p className="mt-2 text-sm text-red-200/80">{errorMessage}</p>
          </div>
        )}

        {pageStatus === "success" && groups.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/15 bg-white/5 px-6 py-14 text-center text-gray-300 backdrop-blur-md">
            <h2 className="text-xl font-semibold text-white">
              {t("summaries.noVisparks")}
            </h2>
            <p className="mt-3 text-sm text-gray-300/80">
              {t("summaries.noVisparksDescription")}
            </p>
          </div>
        )}

        {pageStatus === "success" && groups.length > 0 && (
          <div className="space-y-2">
            {groups.map((group, index) => {
              const accent = gradientPalette[index % gradientPalette.length]

              return (
                <ChannelGroup
                  key={group.channelId}
                  channelTitle={group.channelTitle}
                  channelId={group.channelId}
                  entries={group.entries}
                  accent={accent}
                  expandedChannels={expandedChannels}
                  onToggleExpansion={toggleChannelExpansion}
                  processingVideoId={processingVideoId}
                  processingStatus={status}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SummariesPage
