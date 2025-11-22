import { ReactNode } from "react"

type SettingsSectionProps = {
  title: string
  children: ReactNode
  icon?: ReactNode
}

const SettingsSection = ({ title, children, icon }: SettingsSectionProps) => {
  return (
    <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.75)] backdrop-blur-xl">
      <div className="px-6 py-4 border-b border-white/10">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          {icon}
          {title}
        </h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

export default SettingsSection
