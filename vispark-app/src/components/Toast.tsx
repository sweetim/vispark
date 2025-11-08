import { useEffect, useState } from "react"
import { match } from "ts-pattern"
import { useTranslation } from "react-i18next"
import { CheckCircleIcon, XCircleIcon, WarningCircleIcon, InfoIcon, XIcon } from "@phosphor-icons/react"

type ToastType = "success" | "error" | "warning" | "info"

type ToastProps = {
  message: string
  type: ToastType
  duration?: number
  onClose: () => void
}

const Toast = ({ message, type, duration = 5000, onClose }: ToastProps) => {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Allow time for exit animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const toastStyles = match(type)
    .with("success", () => "bg-emerald-500/20 border-emerald-500/30 backdrop-blur-xl")
    .with("error", () => "bg-red-500/20 border-red-500/30 backdrop-blur-xl")
    .with("warning", () => "bg-amber-500/20 border-amber-500/30 backdrop-blur-xl")
    .with("info", () => "bg-blue-500/20 border-blue-500/30 backdrop-blur-xl")
    .exhaustive()

  const iconColor = match(type)
    .with("success", () => "text-emerald-400")
    .with("error", () => "text-red-400")
    .with("warning", () => "text-amber-400")
    .with("info", () => "text-blue-400")
    .exhaustive()

  const icon = match(type)
    .with("success", () => <CheckCircleIcon className={`w-4 h-4 ${iconColor}`} weight="fill" />)
    .with("error", () => <XCircleIcon className={`w-4 h-4 ${iconColor}`} weight="fill" />)
    .with("warning", () => <WarningCircleIcon className={`w-4 h-4 ${iconColor}`} weight="fill" />)
    .with("info", () => <InfoIcon className={`w-4 h-4 ${iconColor}`} weight="fill" />)
    .exhaustive()

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 z-50 p-2.5 rounded-lg border text-white shadow-lg transform transition-all duration-300 glass-effect ${toastStyles} ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="flex items-center">
        <div className="shrink-0 mr-2">
          {icon}
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <p className="text-xs text-gray-200">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="absolute top-2.5 right-2.5 shrink-0 text-gray-300 hover:text-white focus:outline-none transition-colors"
        >
          <XIcon className="w-3 h-3" weight="bold" />
        </button>
      </div>
    </div>
  )
}

export default Toast
