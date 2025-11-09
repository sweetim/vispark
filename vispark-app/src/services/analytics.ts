import { supabase } from "@/config/supabaseClient.ts"

export type AnalyticsData = {
  visparkVideosProcessed: number
  totalVideosSummarized: number
  totalTimeSavedMinutes: number
  daysActive: number
  weeklyVideosProcessed: number
  monthlyVideosProcessed: number
  mostProductiveDay: string
  favoriteCategory: string
  learningEfficiency: number
  timeSavedPerWeek: number
  weeklyActivity: {
    day: string
    videos: number
    timeSaved: number
  }[]
  topCategories: {
    name: string
    count: number
    percentage: number
  }[]
  trendingTopics: {
    topic: string
    growth: number
    mentions: number
  }[]
}

/**
 * Fetch analytics data for the current user
 */
export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  // Get all visparks for the user
  const { data: visparks, error: visparksError } = await supabase
    .from("visparks")
    .select("id, video_id, video_channel_id, summaries, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (visparksError) {
    throw new Error(
      visparksError.message
        ?? "Failed to fetch analytics data. Please try again.",
    )
  }

  // Get video notifications for additional analytics
  const { data: notifications, error: notificationsError } = await supabase
    .from("video_notifications")
    .select(
      "video_id, channel_id, video_title, published_at, summary_generated, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (notificationsError) {
    console.error("Error fetching notifications:", notificationsError)
  }

  // Calculate analytics from the data
  const analytics = calculateAnalytics(visparks || [], notifications || [])

  return analytics
}

/**
 * Calculate analytics from raw data
 */
function calculateAnalytics(
  visparks: any[],
  notifications: any[],
): AnalyticsData {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Basic counts
  const totalVideosSummarized = visparks.length
  const visparkVideosProcessed = notifications.filter(
    (n) => n.summary_generated,
  ).length

  // Time saved calculations (assuming 10 minutes saved per video on average)
  const averageTimeSavedPerVideo = 10 // minutes
  const totalTimeSavedMinutes = totalVideosSummarized * averageTimeSavedPerVideo

  // Days active (unique days with activity)
  const activityDates = new Set([
    ...visparks.map((v) => new Date(v.created_at).toDateString()),
    ...notifications.map((n) => new Date(n.created_at).toDateString()),
  ])
  const daysActive = activityDates.size

  // Weekly and monthly activity
  const weeklyVisparks = visparks.filter(
    (v) => new Date(v.created_at) >= oneWeekAgo,
  )
  const monthlyVisparks = visparks.filter(
    (v) => new Date(v.created_at) >= oneMonthAgo,
  )
  const weeklyVideosProcessed = weeklyVisparks.length
  const monthlyVideosProcessed = monthlyVisparks.length

  // Weekly activity breakdown
  const weeklyActivity = calculateWeeklyActivity(visparks)

  // Top categories (based on channel frequency)
  const topCategories = calculateTopCategories(visparks)

  // Mock data for demo purposes (in real app, these would be calculated)
  const mostProductiveDay = calculateMostProductiveDay(visparks)
  const favoriteCategory = topCategories[0]?.name || "Technology"
  const learningEfficiency = Math.min(
    95,
    70 + Math.floor(totalVideosSummarized * 0.5),
  )
  const timeSavedPerWeek = weeklyVideosProcessed * averageTimeSavedPerVideo

  // Mock trending topics (in real app, this would analyze summary content)
  const trendingTopics = [
    { topic: "AI & Machine Learning", growth: 24, mentions: 15 },
    { topic: "Remote Work", growth: 18, mentions: 12 },
    { topic: "Sustainable Tech", growth: 15, mentions: 8 },
    { topic: "Web3", growth: 12, mentions: 6 },
  ]

  return {
    visparkVideosProcessed,
    totalVideosSummarized,
    totalTimeSavedMinutes,
    daysActive,
    weeklyVideosProcessed,
    monthlyVideosProcessed,
    mostProductiveDay,
    favoriteCategory,
    learningEfficiency,
    timeSavedPerWeek,
    weeklyActivity,
    topCategories,
    trendingTopics,
  }
}

/**
 * Calculate weekly activity breakdown
 */
function calculateWeeklyActivity(visparks: any[]) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const activity = daysOfWeek.map((day) => ({
    day,
    videos: 0,
    timeSaved: 0,
  }))

  visparks.forEach((vispark) => {
    const date = new Date(vispark.created_at)
    const dayIndex = date.getDay()
    activity[dayIndex].videos++
    activity[dayIndex].timeSaved += 10 // 10 minutes saved per video
  })

  return activity
}

/**
 * Calculate top categories based on channel frequency
 */
function calculateTopCategories(visparks: any[]) {
  const channelCounts: Record<string, number> = {}

  visparks.forEach((vispark) => {
    const channelId = vispark.video_channel_id || "unknown"
    channelCounts[channelId] = (channelCounts[channelId] || 0) + 1
  })

  const total = visparks.length
  const categories = Object.entries(channelCounts)
    .map(([channelId, count]) => ({
      name: getChannelCategoryName(channelId),
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return categories
}

/**
 * Get category name from channel ID (mock implementation)
 */
function getChannelCategoryName(channelId: string): string {
  // In a real implementation, this would fetch channel details and categorize
  const categories = [
    "Technology",
    "Business",
    "Science",
    "Design",
    "Marketing",
    "Education",
  ]
  const hash = channelId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return categories[hash % categories.length]
}

/**
 * Calculate most productive day of the week
 */
function calculateMostProductiveDay(visparks: any[]): string {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]
  const dayCounts = new Array(7).fill(0)

  visparks.forEach((vispark) => {
    const date = new Date(vispark.created_at)
    dayCounts[date.getDay()]++
  })

  const maxCount = Math.max(...dayCounts)
  const mostProductiveDayIndex = dayCounts.indexOf(maxCount)

  return daysOfWeek[mostProductiveDayIndex]
}
