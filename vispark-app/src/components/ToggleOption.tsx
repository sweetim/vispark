import { ToggleSwitch } from "@/components"

type ToggleOptionProps = {
  title: string
  description: string
  isOn: boolean
  onToggle: () => void
}

const ToggleOption = ({
  title,
  description,
  isOn,
  onToggle,
}: ToggleOptionProps) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <div className="flex-shrink-0 pt-1">
        <ToggleSwitch
          isOn={isOn}
          onToggle={onToggle}
        />
      </div>
    </div>
  )
}

export default ToggleOption
