import useSWR from "swr"
import { type AnalyticsData, fetchAnalyticsData } from "@/services/analytics"

// Base SWR configuration for analytics
const analyticsConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 300000, // 5 minutes
  errorRetryCount: 3,
  errorRetryInterval: 5000,
}

// Hook for fetching analytics data
export const useAnalytics = () => {
  const { data, error, isLoading, mutate } = useSWR<AnalyticsData>(
    "analytics",
    fetchAnalyticsData,
    analyticsConfig,
  )

  return {
    analytics: data,
    isLoading,
    error,
    mutate,
  }
}
