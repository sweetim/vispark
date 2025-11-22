import type { FC } from "react"

type AnimatedBackgroundProps = {
  scrollY?: number
}

const AnimatedBackground: FC<AnimatedBackgroundProps> = ({ scrollY = 0 }) => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        style={{
          top: `${10 + scrollY * 0.05}%`,
          left: `${10 - scrollY * 0.02}%`,
        }}
      />
      <div
        className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        style={{
          bottom: `${20 - scrollY * 0.03}%`,
          right: `${15 + scrollY * 0.01}%`,
        }}
      />
    </div>
  )
}

export default AnimatedBackground
