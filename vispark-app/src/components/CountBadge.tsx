import { type ReactNode } from "react"

type CountBadgeProps = {
  count: number
  variant?: "indigo" | "green" | "gray"
  children?: ReactNode
}

const CountBadge = ({ count, variant = "indigo", children }: CountBadgeProps) => {
  const variantClasses = {
    indigo: "bg-indigo-600 rounded-lg text-white",
    green: "bg-green-500/20 text-green-300 rounded-full",
    gray: "bg-white/10 text-gray-300 rounded-full backdrop-blur-sm",
  }

  return (
    <div className={`px-3 py-1 text-sm font-medium ${variantClasses[variant]}`}>
      {children || count}
    </div>
  )
}

export default CountBadge
