import { Outlet } from "@tanstack/react-router"

const WalletLayout = () => {
  return (
    <div className="flex flex-col items-center h-full w-full bg-gray-900 text-white p-2">
      <Outlet />
    </div>
  )
}

export default WalletLayout
