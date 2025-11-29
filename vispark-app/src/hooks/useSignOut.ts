import { useCallback } from "react"
import { useSWRConfig } from "swr"
import { useAuth } from "@/modules/auth"

export const useSignOut = () => {
  const { signOut: authSignOut } = useAuth()
  const { mutate: globalMutate } = useSWRConfig()

  const signOut = useCallback(async () => {
    // First, clear the auth session
    const error = await authSignOut()

    if (error) {
      return error
    }

    // Clear all SWR cache entries to prevent "Auth session missing!" errors
    globalMutate(() => true, undefined, { revalidate: false })

    // Clear any user-specific localStorage data
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key
          && (key.includes("user")
            || key.includes("auth")
            || key.includes("session"))
        ) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key)
      })
    } catch (e) {
      console.error("Failed to clear localStorage:", e)
    }

    return null
  }, [authSignOut, globalMutate])

  return { signOut }
}
