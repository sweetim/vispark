import type { FC } from "react"
import { Outlet } from "@tanstack/react-router"

const RootLayout: FC = () => {
  return (
    <div
      className="w-full bg-gray-900 min-h-screen"
    >
      <Outlet />
    </div>
  )
}

export default RootLayout
