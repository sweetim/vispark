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
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "@tanstack/react-router"

type NavBarItem = {
  to: string
  icon: Icon
  titleKey: string
}

const BottomNavBar: FC = () => {
  const { t } = useTranslation()

  const navBarItems: NavBarItem[] = [
    {
      to: "/app/summaries",
      icon: ListNumbersIcon,
      titleKey: "navigation.summaries",
    },
    {
      to: "/app/channels",
      icon: StackPlusIcon,
      titleKey: "navigation.channels",
    },
    {
      to: "/app/videos",
      icon: LightbulbFilamentIcon,
      titleKey: "navigation.vispark",
    },
    {
      to: "/app/wallet",
      icon: WalletIcon,
      titleKey: "navigation.wallet",
    },
    {
      to: "/app/settings",
      icon: UserCircleGearIcon,
      titleKey: "navigation.settings",
    },
  ]

  const location = useLocation()
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
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-800 border-none z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className={`grid h-full max-w-lg grid-cols-5 mx-auto font-medium`}>
          {navBarItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.to)
            const NavIcon = item.icon

            return (
              <Link
                to={item.to}
                className="inline-flex flex-col items-center justify-center px-5 hover:bg-zinc-800 group"
                key={`${index}-${item.to}`}
                title={t(item.titleKey)}
              >
                <NavIcon
                  size={32}
                  color={isActive ? "#ffffff" : "#6b7280"}
                  weight="fill"
                  className={clsx("group-hover:fill-[#ffebeb]", {
                    "active-icon": isActive,
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
