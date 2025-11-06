import { Outlet } from "react-router"
import BottomNavBar from "@/modules/nav/BottomNavBar"

const AppLayout = () => {
  return (
    <div className="flex flex-col h-svh w-full bg-primary">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <BottomNavBar />
    </div>
  )
}

export default AppLayout
