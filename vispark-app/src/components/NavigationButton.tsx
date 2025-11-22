import type { FC, ReactNode } from "react"
import type { Icon } from "@phosphor-icons/react"
import clsx from "clsx"

type NavigationButtonProps = {
  to?: string
  icon?: Icon
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  className?: string
}

const NavigationButton: FC<NavigationButtonProps> = ({
  to,
  icon: ButtonIcon,
  children,
  onClick,
  variant = "secondary",
  size = "md",
  disabled = false,
  className = ""
}) => {
  const baseClasses = "flex items-center gap-3 font-medium transition-colors"

  const sizeClasses = {
    sm: "px-3 py-2 text-sm rounded-lg",
    md: "px-4 py-3 text-base rounded-xl",
    lg: "px-6 py-4 text-lg rounded-2xl"
  }

  const variantClasses = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
    secondary: "text-gray-300 hover:text-white hover:bg-white/5",
    ghost: "text-gray-300 hover:text-white"
  }

  const buttonContent = (
    <>
      {ButtonIcon && <ButtonIcon size={20} weight="duotone" />}
      {children}
    </>
  )

  const buttonClasses = clsx(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    {
      "opacity-50 cursor-not-allowed": disabled
    },
    className
  )

  if (to) {
    return (
      <button
        type="button"
        onClick={() => window.location.href = to}
        disabled={disabled}
        className={buttonClasses}
      >
        {buttonContent}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {buttonContent}
    </button>
  )
}

export default NavigationButton
