import type {
  AuthChangeEvent,
  AuthError,
  Session,
  User,
} from "@supabase/supabase-js"
import {
  type FC,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { supabase } from "@/config/supabaseClient.ts"
import { AuthContext } from "./AuthContext"

export type AuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
  signInWithPassword: (credentials: {
    email: string
    password: string
  }) => Promise<AuthError | null>
  signUpWithPassword: (credentials: {
    email: string
    password: string
  }) => Promise<AuthError | null>
  signInWithGoogle: () => Promise<AuthError | null>
  signOut: () => Promise<AuthError | null>
}

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const bootstrapSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (!isMounted) return

      if (error) {
        console.error("Failed to fetch initial session", error)
        setSession(null)
      } else {
        setSession(data.session)
      }

      setLoading(false)
    }

    bootstrapSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, nextSession: Session | null) => {
        if (!isMounted) return
        setSession(nextSession)
        setLoading(false)
      },
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signInWithPassword = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Supabase sign-in error", error)
        return error
      }

      return null
    },
    [],
  )

  const signUpWithPassword = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error("Supabase sign-up error", error)
        return error
      }

      return null
    },
    [],
  )

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = `${window.location.origin}/app`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    })

    if (error) {
      console.error("Supabase Google OAuth error", error)
      return error
    }

    return null
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Supabase sign-out error", error)
      return error
    }

    return null
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
    }),
    [
      loading,
      session,
      signInWithPassword,
      signInWithGoogle,
      signOut,
      signUpWithPassword,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
