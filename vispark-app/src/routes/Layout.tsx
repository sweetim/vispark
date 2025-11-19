import type { FC } from "react"
import { Outlet } from "@tanstack/react-router"
import { ToastProvider } from "@/contexts/ToastContext"
import { VideoProcessingListener } from "@/components/VideoProcessingListener"

const RootLayout: FC = () => {
  return (
    <div
      className="w-full bg-gray-900 min-h-screen"
    >
      <ToastProvider>
        <VideoProcessingListener />
        <Outlet />
      </ToastProvider>
    </div>
  )
}

export default RootLayout
