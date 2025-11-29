import type { FC, ReactNode } from "react"

type PageHeaderProps = {
  title: string
  subtitle?: string
  icon?: ReactNode
  children?: ReactNode
}

const PageHeader: FC<PageHeaderProps> = ({ title, subtitle, icon, children }) => {
  return (
    <div className="relative h-full overflow-y-auto overflow-x-hidden">
      <div className="pointer-events-none absolute -top-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/25 blur-3xl" />
      <div className="pointer-events-none absolute top-20 left-[-12%] h-96 w-96 rounded-full bg-blue-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-18%] right-[-8%] h-96 w-96 rounded-full bg-emerald-500/20 blur-[140px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <header className="mb-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {icon}
              <h1 className="text-4xl font-black text-white sm:text-5xl lg:text-6xl">{title}</h1>
            </div>
            {subtitle && <p className="max-w-2xl text-base text-gray-300/90 sm:text-lg">{subtitle}</p>}
          </div>
          {children}
        </header>
      </div>
    </div>
  )
}

export default PageHeader
