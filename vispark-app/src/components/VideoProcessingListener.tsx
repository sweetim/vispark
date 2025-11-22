import { useEffect } from "react"
import { useLocation } from "@tanstack/react-router"
import { useVideoStore } from "@/stores/videoStore"
import { useToast } from "@/contexts/ToastContext"

const VideoProcessingListener = () => {
  const notification = useVideoStore((state) => state.notification)
  const clearNotification = useVideoStore((state) => state.clearNotification)
  const { showToast } = useToast()
  const location = useLocation()

  useEffect(() => {
    // Check if we're on the VideoPage
    const isVideoPage = location.pathname.startsWith("/app/videos/") &&
      location.pathname.split("/").length === 4 // /app/videos/{videoId}

    if (notification && !isVideoPage) {
      showToast(
        notification.message,
        notification.type,
        undefined,
        notification.videoId,
        notification.videoMetadata
      )
      clearNotification()
    } else if (notification && isVideoPage) {
      // Just clear the notification without showing toast on VideoPage
      clearNotification()
    }
  }, [notification, showToast, clearNotification, location])

  return null
}

export default VideoProcessingListener
