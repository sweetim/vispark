import type { FC } from "react"
import { decodeHtmlEntities } from "@/utils"

type SummaryListProps = {
  items: string[]
  isStreaming?: boolean
}

const SummaryList: FC<SummaryListProps> = ({ items, isStreaming = false }) => {
  if (!items.length) {
    return null
  }

  return (
    <div>
      <ul className={`list-disc list-inside text-sm leading-relaxed bg-gray-800 border border-gray-700 rounded-md p-4 ${isStreaming ? 'border-blue-500/30' : ''}`}>
        {items.map((item, index) => (
          <li
            key={`${index}-${item.slice(0, 16)}`}
            className={`mb-1 ${isStreaming ? 'animate-pulse' : ''}`}
          >
            {decodeHtmlEntities(item)}
          </li>
        ))}
        {isStreaming && (
          <li className="mb-1 text-gray-400 animate-pulse">
            <span className="inline-block w-2 h-4 bg-gray-400 rounded-full mr-2"></span>
            Generating...
          </li>
        )}
      </ul>
    </div>
  )
}

export default SummaryList
