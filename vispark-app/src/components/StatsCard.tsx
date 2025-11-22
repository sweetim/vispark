import type { FC, ReactNode } from "react"
import { match } from "ts-pattern"

type StatsCardProps = {
  title: string
  children?: ReactNode
  className?: string
  color?: string
}

const StatsCard: FC<StatsCardProps> = ({
  title,
  children,
  className = "",
  color = ""
}) => {
  const colorClasses = match(color)
    .with("indigo", () => "bg-indigo-800 border-indigo-600")
    .with("green", () => "bg-green-800 border-green-600")
    .otherwise(() => "bg-gray-800")

  return (
    <div className={`${colorClasses} rounded-lg p-4 shadow-lg border ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-3 text-white">{title}</h3>
        {children}
      </div>
    </div>
  )
}

export default StatsCard
