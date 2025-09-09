import { BellIcon, CheckFatIcon } from "@phosphor-icons/react"
import { useEffect, useId, useState } from "react"
import Markdown from "react-markdown"
import { useNavigate } from "react-router"
import useYoutubeSearch from "@/hooks/useYoutubeSearch"

const VisparkPage = () => {
  const [videoId, setVideoId] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [response, setResponse] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const reactId = useId()
  const inputId = `videoId-${reactId}`

  const fetchVispark = async (id: string) => {
    if (!id) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      // https://vispark.netlify.app
      const url = `http://localhost:9999/.netlify/functions/vispark?video-id=${encodeURIComponent(
        id,
      )}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
      const json = await res.json()
      setResponse(json.result)
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault()
    fetchVispark(videoId.trim())
  }

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gray-900 text-white p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-3xl"
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
            className="flex-1 px-3 py-2 rounded-l-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-r-md text-white"
            aria-label="Fetch vispark"
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

        {response && (
          <div className="mt-3">
            <div className="text-xs text-gray-400 mb-2">Summary</div>
            <Markdown>{response}</Markdown>
          </div>
        )}
      </div>
    </div>
  )
}

export default VisparkPage
