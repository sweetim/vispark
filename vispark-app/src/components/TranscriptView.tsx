import type { FC } from "react"

type TranscriptViewProps = {
  transcript: string
}

const TranscriptView: FC<TranscriptViewProps> = ({ transcript }) => {
  if (!transcript) {
    return null
  }

  return (
    <div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap bg-gray-800 border border-gray-700 rounded-md p-4">
        {transcript}
      </div>
    </div>
  )
}

export default TranscriptView
