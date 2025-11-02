import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import Toast from "@/components/Toast"

type ToastType = "success" | "error" | "warning" | "info"

type ToastMessage = {
  id: string
  message: string
  type: ToastType
  duration?: number
}

type ToastContextType = {
  showToast: (message: string, type: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

type ToastProviderProps = {
  children: ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback(
    (message: string, type: ToastType, duration?: number) => {
      const id = Date.now().toString()
      const newToast: ToastMessage = {
        id,
        message,
        type,
        duration,
      }

      setToasts((prevToasts) => [...prevToasts, newToast])
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
