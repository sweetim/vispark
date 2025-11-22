import type { FC } from "react"
import clsx from "clsx"

type TabItem = {
  id: string
  label: string
  disabled?: boolean
}

type TabNavigationProps = {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

const TabNavigation: FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ""
}) => {
  return (
    <div className={`flex bg-gray-800 rounded-lg p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={clsx(
            "flex-1 py-2 px-4 rounded-md transition-colors text-sm font-medium",
            {
              "bg-indigo-600 text-white": activeTab === tab.id,
              "text-gray-400 hover:text-white": activeTab !== tab.id,
              "opacity-50 cursor-not-allowed": tab.disabled
            }
          )}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          disabled={tab.disabled}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default TabNavigation
