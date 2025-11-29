import { Outlet } from "@tanstack/react-router"
import BottomNavBar from "@/modules/nav/BottomNavBar"

const AppLayout = () => {
  return (
    <div className="flex flex-col h-[calc(100svh-4rem)] w-full bg-primary">
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-primary">
        <BottomNavBar />
      </div>
    </div>
  )
}

export default AppLayout
