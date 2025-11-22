import { useState } from "react"
import type { FC } from "react"

type UserAvatarProps = {
  src?: string | null
  alt?: string
  name?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const UserAvatar: FC<UserAvatarProps> = ({
  src,
  alt,
  name = "User",
  size = "md",
  className = ""
}) => {
  const [avatarError, setAvatarError] = useState(false)

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg",
    xl: "w-20 h-20 text-xl"
  }

  const displayName = name.trim()
  const userInitial = displayName.charAt(0).toUpperCase() || "U"
  const avatarUrl = avatarError ? null : src

  return avatarUrl ? (
    <img
      src={avatarUrl}
      alt={alt || `${name} avatar`}
      onError={() => setAvatarError(true)}
      className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-700 ${className}`}
    />
  ) : (
    <div className={`${sizeClasses[size]} rounded-full bg-indigo-600 flex items-center justify-center font-semibold text-white ${className}`}>
      {userInitial}
    </div>
  )
}

export default UserAvatar
