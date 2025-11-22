import type { FC, ReactNode } from "react"

type StatsCardProps = {
  title: string
  children?: ReactNode
  className?: string
}

const StatsCard: FC<StatsCardProps> = ({
  title,
  children,
  className = ""
}) => {
  return (
    <div className={`bg-gray-800 rounded-lg p-4 shadow-lg ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-3 text-white">{title}</h3>
        {children}
      </div>
    </div>
  )
}

export default StatsCard
