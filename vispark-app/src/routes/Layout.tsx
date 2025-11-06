import type { FC } from "react"
import { Outlet } from "react-router"

const RootLayout: FC = () => {
  return (
    <div
      className="w-full bg-gray-900 h-dvh overflow-hidden"
    >
      <Outlet />
    </div>
  )
}

export default RootLayout
