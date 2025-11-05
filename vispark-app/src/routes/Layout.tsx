import type { FC } from "react"
import { Outlet } from "react-router"
import { useEffect, useState } from "react"

const RootLayout: FC = () => {
  const [maxHeight, setMaxHeight] = useState<string>("100dvh")

  useEffect(() => {
    const calculateMaxHeight = () => {
      // Get the actual viewport height
      const viewportHeight = window.innerHeight

      // Get any potential offset elements (like mobile browser UI)
      const documentElement = document.documentElement
      const documentHeight = documentElement.clientHeight

      // Use the smaller of the two to ensure content fits
      const calculatedHeight = Math.min(viewportHeight, documentHeight)

      // Set the max height with a small buffer to account for any UI elements
      setMaxHeight(`${calculatedHeight}px`)
    }

    // Calculate initial height
    calculateMaxHeight()

    // Recalculate on window resize and orientation change
    window.addEventListener("resize", calculateMaxHeight)
    window.addEventListener("orientationchange", calculateMaxHeight)

    // Cleanup event listeners
    return () => {
      window.removeEventListener("resize", calculateMaxHeight)
      window.removeEventListener("orientationchange", calculateMaxHeight)
    }
  }, [])

  return (
    <div
      className="w-full bg-primary overflow-hidden"
      style={{ maxHeight, height: maxHeight }}
    >
      <Outlet />
    </div>
  )
}

export default RootLayout
