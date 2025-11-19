import { useEffect } from "react"
import { useVideoStore } from "@/stores/videoStore"
import { useToast } from "@/contexts/ToastContext"

export const VideoProcessingListener = () => {
  const notification = useVideoStore((state) => state.notification)
  const clearNotification = useVideoStore((state) => state.clearNotification)
  const { showToast } = useToast()

  useEffect(() => {
    if (notification) {
      showToast(notification.message, notification.type)
      clearNotification()
    }
  }, [notification, showToast, clearNotification])

  return null
}
