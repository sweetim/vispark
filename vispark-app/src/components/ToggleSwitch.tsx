type ToggleSwitchProps = {
  isOn: boolean
  onToggle?: () => void
  disabled?: boolean
}

const ToggleSwitch = ({ isOn, onToggle, disabled = false }: ToggleSwitchProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        isOn ? "bg-indigo-600" : "bg-gray-600"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isOn ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )
}

export default ToggleSwitch
