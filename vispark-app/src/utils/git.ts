/**
 * Git utility functions
 */

/**
 * Gets the current git commit hash (short version)
 * @returns string The short commit hash
 */
export const getGitCommitHash = (): string => {
  return __GIT_COMMIT_HASH__ || "unknown"
}

/**
 * Gets the current git commit hash with build timestamp
 * @returns string The version string with commit hash and timestamp
 */
export const getAppVersion = (): string => {
  const commitHash = getGitCommitHash()
  const buildTime = __BUILD_TIME__ || new Date().toISOString().split("T")[0]
  const version = `${commitHash} (${buildTime})`

  return version
}
