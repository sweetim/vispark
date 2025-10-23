import type { FC } from "react"
import { Outlet } from "react-router"

const RootLayout: FC = () => {
  return (
    <div className="w-full h-dvh bg-primary">
      <Outlet />
    </div>
  )
}

export default RootLayout
