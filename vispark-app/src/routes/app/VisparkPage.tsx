import { useId, useState } from "react"
import { supabase } from "@/config/supabaseClient.ts"

type TranscriptItem = {
  text: string
  offset?: number
  duration?: number
}

type TranscriptServiceResponse =
  | {
      data: {
        videoId: string
        transcript: TranscriptItem[]
        lang?: string
      }
    }
  | {
      error: string
      message: string
    }

const formatTranscript = (segments: TranscriptItem[]): string =>
  segments
    .map(({ text }) => text.trim())
    .filter((segment) => segment.length > 0)
    .join("\n")

const VisparkPage = () => {
  const [videoId, setVideoId] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [transcript, setTranscript] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const reactId = useId()
  const inputId = `videoId-${reactId}`

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    const trimmedVideoId = videoId.trim()

    if (trimmedVideoId.length === 0) {
      setError("Please enter a video ID before submitting.")
      setTranscript("")
      return
    }

    setLoading(true)
    setError(null)
    setTranscript("")

    try {
      const response = await fetch(
        "http://127.0.0.1:54321/functions/v1/transcript",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
            Authorization: `Bearer ${
              (await supabase.auth.getSession()).data.session?.access_token
              ?? (import.meta.env.VITE_SUPABASE_ANON_KEY as string)
            }`,
          },
          body: JSON.stringify({
            videoId: trimmedVideoId,
          }),
        },
      )

      const body = (await response
        .json()
        .catch(() => null)) as TranscriptServiceResponse | null

      if (!response.ok) {
        const message =
          body && "message" in body && typeof body.message === "string"
            ? body.message
            : "Failed to fetch transcript. Please try again."
        setError(message)
        return
      }

      if (!body || !("data" in body) || !Array.isArray(body.data.transcript)) {
        setError("Unexpected response format from transcript service.")
        return
      }

      setTranscript(formatTranscript(body.data.transcript))
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while fetching the transcript."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gray-900 text-white p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-3xl"
        aria-busy={loading}
      >
        <label
          htmlFor={inputId}
          className="block mb-2 text-sm text-gray-300"
        >
          Enter video ID and press Enter
        </label>
        <div className="flex">
          <input
            id={inputId}
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            placeholder="e.g. dQw4w9WgXcQ"
            className="flex-1 px-3 py-2 rounded-l-md bg-gray-800 border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-r-md text-white disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Fetch vispark"
            disabled={loading}
          >
            GO
          </button>
        </div>
      </form>

      <div className="w-full max-w-3xl mt-4">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <svg
              className="animate-spin h-5 w-5 text-indigo-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              role="img"
              aria-hidden="false"
            >
              <title>Loading</title>
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span>Loading...</span>
          </div>
        )}

        {error && <div className="mt-2 text-red-400 text-sm">{error}</div>}

        {transcript && (
          <div className="mt-3">
            <div className="text-xs text-gray-400 mb-2">Transcript</div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap bg-gray-800 border border-gray-700 rounded-md p-4">
              {transcript}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VisparkPage
