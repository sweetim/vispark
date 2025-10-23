import { Outlet } from "react-router"
import BottomNavBar from "@/modules/nav/BottomNavBar"

const AppLayout = () => {
  return (
    <div className="flex flex-col h-screen w-full bg-primary">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      <BottomNavBar />
    </div>
  )
}

export default AppLayout
