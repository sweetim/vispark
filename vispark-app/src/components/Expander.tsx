import { useState } from "react"
import { CaretDownIcon, SparkleIcon } from "@phosphor-icons/react"

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
        </div>
        {isSummarizing && (
          <div className="flex items-center justify-center">
            <SparkleIcon
              size={20}
              weight="fill"
              className="text-purple-400 animate-spin"
              style={{ animationDuration: '2s' }}
            />
          </div>
        )}
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
