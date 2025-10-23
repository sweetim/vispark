import { LightbulbFilamentIcon } from "@phosphor-icons/react"
import clsx from "clsx"
import type { FC } from "react"

type VisparkIconProps = {
  isActive: boolean
}

const VisparkIcon: FC<VisparkIconProps> = ({ isActive }) => (
  <span className="relative flex h-12 w-12 items-center justify-center">
    <span
      className={clsx(
        "absolute inset-0 rounded-full bg-linear-to-br from-amber-300 via-fuchsia-400 to-sky-400 opacity-60 blur-lg transition-all duration-500 group-hover:opacity-85 group-hover:blur-xl",
        {
          "opacity-95": isActive,
        },
      )}
    />
    <span
      className={clsx(
        "absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9),rgba(255,255,255,0))] opacity-0 transition-opacity duration-500 group-hover:opacity-80",
        {
          "opacity-80": isActive,
        },
      )}
    />
    <span
      className={clsx(
        "absolute -top-1 left-1 h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-ping",
        isActive ? "block" : "hidden group-hover:block",
      )}
    />
    <span
      className={clsx(
        "absolute -bottom-1 right-1 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)] animate-ping [animation-delay:400ms]",
        isActive ? "block" : "hidden group-hover:block",
      )}
    />
    <span
      className={clsx(
        "absolute h-9 w-9 rounded-full border border-dashed border-white/70 opacity-0 transition-opacity duration-500",
        isActive
          ? "opacity-70 animate-[spin_3.5s_linear_infinite]"
          : "group-hover:opacity-70 group-hover:animate-[spin_3.5s_linear_infinite]",
      )}
    />
    <LightbulbFilamentIcon
      size={40}
      weight="fill"
      color={isActive ? "#fff9db" : "#fde68a"}
      className={clsx(
        "relative transition-transform duration-500 drop-shadow-[0_0_14px_rgba(252,211,77,0.75)] group-hover:scale-[1.1] group-hover:rotate-3",
        {
          "scale-[1.08]": isActive,
        },
      )}
      style={{
        filter: isActive
          ? "drop-shadow(0 0 18px rgba(252,211,77,0.9)) drop-shadow(0 0 28px rgba(244,114,182,0.65)) drop-shadow(0 0 32px rgba(56,189,248,0.5))"
          : "drop-shadow(0 0 12px rgba(252,211,77,0.7))",
        transition: "transform 0.5s ease, filter 0.5s ease",
      }}
    />
  </span>
)

export default VisparkIcon
