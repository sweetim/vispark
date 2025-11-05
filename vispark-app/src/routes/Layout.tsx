import type { FC } from "react"
import { Outlet } from "react-router"

const RootLayout: FC = () => {
  return (
    <div
      className="w-full bg-primary h-dvh overflow-hidden"
    >
      <Outlet />
    </div>
  )
}

export default RootLayout
