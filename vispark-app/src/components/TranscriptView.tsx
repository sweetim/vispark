import type { FC } from "react"
import { decodeHtmlEntities } from "@/utils"

type TranscriptViewProps = {
  transcript: string
}

const TranscriptView: FC<TranscriptViewProps> = ({ transcript }) => {
  if (!transcript) {
    return null
  }

  return (
    <div>
      <div className="glass-effect text-sm leading-relaxed whitespace-pre-wrap bg-white/5 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
        {decodeHtmlEntities(transcript)}
      </div>
    </div>
  )
}

export default TranscriptView
