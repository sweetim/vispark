import BottomNavBar from "@/modules/nav/BottomNavBar"
import { Outlet } from "react-router"

const AppRootPage = () => {
  return (
    <div className="flex flex-col h-full w-full bg-primary min-h-screen">
      <div className="flex-auto overflow-auto pb-16">
        <Outlet />
      </div>
      <BottomNavBar />
    </div>
  )
}

export default AppRootPage
