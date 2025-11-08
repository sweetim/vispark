/**
 * Git utility functions
 */

/**
 * Gets the current git commit hash (short version)
 * @returns string The short commit hash
 */
export const getGitCommitHash = (): string => {
  try {
    // Use the injected value from build time
    return import.meta.env.__GIT_COMMIT_HASH__ || "unknown"
  } catch (error) {
    console.error("Failed to get git commit hash:", error)
    return "unknown"
  }
}

/**
 * Gets the current git commit hash with build timestamp
 * @returns string The version string with commit hash and timestamp
 */
export const getAppVersion = (): string => {
  try {
    const commitHash = getGitCommitHash()
    const buildTime =
      import.meta.env.__BUILD_TIME__ || new Date().toISOString().split("T")[0]
    return `${commitHash} (${buildTime})`
  } catch (error) {
    console.error("Failed to get app version:", error)
    return "unknown"
  }
}
