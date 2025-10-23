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
import { match, P } from "ts-pattern"

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
    to: "wallet",
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
  const currentToRoute = location.pathname.split("/", 3).pop() ?? ""
  return (
    <>
      <style>{`
        @keyframes sparkle {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 2px rgba(255, 255, 255, 0.7));
          }
          25% {
            filter: brightness(1.3) drop-shadow(0 0 8px rgba(255, 255, 255, 0.9));
          }
          50% {
            filter: brightness(1.5) drop-shadow(0 0 15px rgba(255, 255, 255, 1));
          }
          75% {
            filter: brightness(1.2) drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
          }
        }

        @keyframes rainbow {
          0% {
            color: #ff0080;
            filter: drop-shadow(0 0 8px #ff0080);
          }
          16.66% {
            color: #ff8000;
            filter: drop-shadow(0 0 8px #ff8000);
          }
          33.33% {
            color: #ffff00;
            filter: drop-shadow(0 0 8px #ffff00);
          }
          50% {
            color: #00ff80;
            filter: drop-shadow(0 0 8px #00ff80);
          }
          66.66% {
            color: #0080ff;
            filter: drop-shadow(0 0 8px #0080ff);
          }
          83.33% {
            color: #8000ff;
            filter: drop-shadow(0 0 8px #8000ff);
          }
          100% {
            color: #ff0080;
            filter: drop-shadow(0 0 8px #ff0080);
          }
        }

        .active-icon {
          animation: rainbow 3s linear infinite, sparkle 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-800 border-none z-50">
        <div className={`grid h-full max-w-lg grid-cols-5 mx-auto font-medium`}>
          {navBarItems.map((item, index) => {
            const isPathMatching = match([item.to, currentToRoute])
              .with(["", ""], () => true)
              .with(
                ["", P.string],
                () =>
                  location.pathname === "/app" || location.pathname === "/app/",
              )
              .with([P.string, P.string], () => currentToRoute === item.to)
              .otherwise(() => false)

            const navIconColor = match(isPathMatching)
              .with(true, () => "#ffffff")
              .otherwise(() => "#6b7280")

            const NavIcon = item.icon

            return (
              <Link
                to={item.to}
                className="inline-flex flex-col items-center justify-center px-5 hover:bg-zinc-800 group"
                key={`${index}-${item.to}`}
              >
                <NavIcon
                  size={32}
                  color={navIconColor}
                  weight="fill"
                  className={clsx("group-hover:fill-[#ffebeb]", {
                    "active-icon": isPathMatching,
                  })}
                />
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default BottomNavBar
