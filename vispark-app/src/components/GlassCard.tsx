import type { FC, ReactNode } from "react"
import clsx from "clsx"

type GlassCardProps = {
  children: ReactNode
  className?: string
  header?: ReactNode
  footer?: ReactNode
  padding?: "none" | "sm" | "md" | "lg"
}

const GlassCard: FC<GlassCardProps> = ({
  children,
  className,
  header,
  footer,
  padding = "md"
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  }

  return (
    <div className={clsx(
      "relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.75)] backdrop-blur-xl",
      className
    )}>
      {header && (
        <div className="px-6 py-4 border-b border-white/10">
          {header}
        </div>
      )}
      <div className={paddingClasses[padding]}>
        {children}
      </div>
      {footer && (
        <div className="p-4 border-t border-white/10">
          {footer}
        </div>
      )}
    </div>
  )
}

export default GlassCard
