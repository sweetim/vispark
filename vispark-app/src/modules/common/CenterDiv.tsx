import type { FC, ReactElement } from "react"

type CenterDivProps = {
  className?: string
  children?: ReactElement | ReactElement[]
}

const CenterDiv: FC<CenterDivProps> = ({ children, className }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 w-full h-full ${className}`}
    >
      {children}
    </div>
  )
}

export default CenterDiv
