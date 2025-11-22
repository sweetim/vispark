import { MagnifyingGlassIcon, SmileySadIcon } from "@phosphor-icons/react"

type EmptyStateIllustrationProps = {
  type: "search" | "no-results"
}

const EmptyStateIllustration = ({
  type,
}: EmptyStateIllustrationProps) => {
  if (type === "search") {
    return (
      <div className="flex flex-col items-center space-y-4 animate-float">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
            <MagnifyingGlassIcon
              size={40}
              className="text-indigo-400"
            />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4 animate-float">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-linear-to-br from-gray-600/20 to-gray-700/20 flex items-center justify-center">
          <SmileySadIcon
            size={40}
            className="text-gray-400"
          />
        </div>
      </div>
    </div>
  )
}

export default EmptyStateIllustration
