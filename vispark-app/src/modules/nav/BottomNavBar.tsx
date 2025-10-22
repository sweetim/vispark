import {
  type Icon,
  LightbulbFilamentIcon,
  ListNumbersIcon,
  StackPlusIcon,
  UserCircleGearIcon,
  WalletIcon,
} from "@phosphor-icons/react"
import clsx from "clsx"
import type { FC } from "react"
import { Link, useLocation } from "react-router"
import { match } from "ts-pattern"
import { useNavBarStore } from "@/modules/nav/store"

type NavBarItem = {
  to: string
  icon: Icon
  title: string
}

const navBarItems: NavBarItem[] = [
  {
    to: "",
    icon: ListNumbersIcon,
    title: "Summaries",
  },
  {
    to: "channel",
    icon: StackPlusIcon,
    title: "Channels",
  },
  {
    to: "vispark",
    icon: LightbulbFilamentIcon,
    title: "VISPARK",
  },
  {
    to: "/wallet",
    icon: WalletIcon,
    title: "Wallet",
  },
  {
    to: "settings",
    icon: UserCircleGearIcon,
    title: "Settings",
  },
]

const BottomNavBar: FC = () => {
  const location = useLocation()
  const currentToRoute = location.pathname.split("/", 3).join("/")
  const triggerVisparkReset = useNavBarStore((s) => s.triggerVisparkReset)

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-800 border-none z-50">
      <div className={`grid h-full max-w-lg grid-cols-5 mx-auto font-medium`}>
        {navBarItems.map((item, index) => {
          const isPathMatching = currentToRoute === item.to

          const linkClassName = clsx(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-zinc-900 group",
            {
              "bg-zinc-900": isPathMatching,
            },
          )

          const spanClassName = clsx(
            "text-sm text-gray-500 group-hover:text-white",
            {
              "text-white": isPathMatching,
            },
          )

          const navIconColor = match(isPathMatching)
            .with(true, () => "#ffebeb")
            .otherwise(() => "#6b7280")

          const NavIcon = item.icon

          return (
            <Link
              to={item.to}
              className={linkClassName}
              key={`${index}-${item.to}`}
              onClick={
                item.to === "vispark" ? () => triggerVisparkReset() : undefined
              }
            >
              <NavIcon
                size={32}
                color={navIconColor}
                weight="fill"
                className="group-hover:fill-[#ffebeb]"
              />
              <span className={spanClassName}>{item.title}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNavBar
