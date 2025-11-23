import { useState } from "react"
import { CaretDownIcon } from "@phosphor-icons/react"

type ExpanderProps = {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  className?: string
  isExpanded?: boolean
  onToggle?: () => void
  isSummarizing?: boolean
}

const Expander = ({
  title,
  children,
  defaultExpanded = false,
  className = "",
  isExpanded: controlledIsExpanded,
  onToggle,
  isSummarizing = false
}: ExpanderProps) => {
  // Use internal state if not controlled, otherwise use the controlled prop
  const [internalIsExpanded, setInternalIsExpanded] = useState(defaultExpanded)
  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : internalIsExpanded

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalIsExpanded(!isExpanded)
    }
  }

  return (
    <div className={`border border-gray-800 rounded-lg ${className}`}>
      <div
        className="sticky top-0 z-10 flex items-center justify-between cursor-pointer p-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl transition-all duration-200 hover:bg-gray-800/50"
        onClick={handleToggle}
      >
        <div className="flex items-center space-x-3">
          <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-900' : ''}`}>
            <CaretDownIcon className="w-5 h-5 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {isSummarizing && (
            <div className="inline-flex h-5 items-center rounded-md px-2 backdrop-blur shrink-0 bg-blue-600/80 text-xs font-medium tracking-wide text-white border border-blue-400/30 animate-pulse">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                <span className="text-xs font-medium text-white">
                  SUMMARIZING
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="pl-3 py-1 bg-gray-900/30">
          {children}
        </div>
      )}
    </div>
  )
}

export default Expander
