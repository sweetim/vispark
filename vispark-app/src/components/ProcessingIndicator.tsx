import type { FC } from "react"
import LoadingSpinner from "./LoadingSpinner"

type ProcessingIndicatorProps = {
  isProcessing: boolean
  text?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const ProcessingIndicator: FC<ProcessingIndicatorProps> = ({
  isProcessing,
  text = "Processing...",
  size = "sm",
  className = ""
}) => {
  if (!isProcessing) return null

  return (
    <div className={`inline-flex h-5 items-center rounded-md px-2 backdrop-blur shrink-0 bg-blue-600/80 text-xs font-medium tracking-wide text-white border border-blue-400/30 animate-pulse ${className}`}>
      <div className="flex items-center space-x-1">
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
        <LoadingSpinner size="sm" color="white" />
        <span className="text-xs font-medium text-white">
          {text.toUpperCase()}
        </span>
      </div>
    </div>
  )
}

export default ProcessingIndicator
