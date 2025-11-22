import type { FC } from "react"

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg"
  color?: "white" | "indigo" | "gray" | "green" | "red"
  className?: string
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "white",
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }

  const colorClasses = {
    white: "border-white border-t-transparent",
    indigo: "border-indigo-500 border-t-transparent",
    gray: "border-gray-300 border-t-transparent",
    green: "border-green-400 border-t-transparent",
    red: "border-red-500 border-t-transparent"
  }

  return (
    <div
      className={`border-2 ${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

export default LoadingSpinner
