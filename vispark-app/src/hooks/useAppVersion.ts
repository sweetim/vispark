import { useEffect, useState } from "react"
import { getAppVersion } from "@/utils/git"

/**
 * Hook to get the app version information
 * @returns {string} The app version string
 */
export const useAppVersion = (): string => {
  const [version, setVersion] = useState<string>("Loading...")

  useEffect(() => {
    // Get the version from our utility function
    const appVersion = getAppVersion()
    setVersion(appVersion)
  }, [])

  return version
}
