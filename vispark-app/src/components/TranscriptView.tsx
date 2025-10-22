import type { FC } from "react"

type TranscriptViewProps = {
  transcript: string
}

const TranscriptView: FC<TranscriptViewProps> = ({ transcript }) => {
  if (!transcript) {
    return null
  }

  return (
    <div className="mt-3">
      <div className="text-xs text-gray-400 mb-2">Transcript</div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap bg-gray-800 border border-gray-700 rounded-md p-4">
        {transcript}
      </div>
    </div>
  )
}

export default TranscriptView
