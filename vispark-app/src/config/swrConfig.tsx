import { SWRConfig } from "swr"

// Global fetcher for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url)

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.") as any
    try {
      error.info = await res.json()
    } catch {
      error.info = { message: res.statusText }
    }
    error.status = res.status
    throw error
  }

  return res.json()
}

// SWR Provider component with global configuration
export const SWRProvider = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig
    value={{
      fetcher,
      onError: (error, key) => {
        console.error("SWR Error:", error, "Key:", key)

        // Don't retry on 404 errors
        if (error.status === 404) {
          return
        }

        // Don't retry on authentication errors
        if (error.status === 401 || error.status === 403) {
          return
        }
      },
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute default
      focusThrottleInterval: 5000,
      loadingTimeout: 30000, // 30 seconds timeout
    }}
  >
    {children}
  </SWRConfig>
)
