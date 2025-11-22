import type { FC, ReactNode } from "react"

type AuthFormContainerProps = {
  title?: string
  subtitle?: string
  children: ReactNode
}

const AuthFormContainer: FC<AuthFormContainerProps> = ({ title, subtitle, children }) => {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl overflow-hidden">
      <div className="p-6 space-y-6">
        {title && (
          <div className="text-center space-y-2">
            <h3 className="text-white mb-0 text-xl font-semibold">{title}</h3>
            {subtitle && <p className="text-zinc-400 text-sm">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export default AuthFormContainer
