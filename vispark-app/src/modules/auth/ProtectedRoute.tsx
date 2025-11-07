import type { FC, ReactElement } from "react"
import { Navigate } from "@tanstack/react-router"

import CenterDiv from "@/modules/common/CenterDiv.tsx"
import { useAuth } from "./useAuth.ts"

type ProtectedRouteProps = {
  children: ReactElement
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <CenterDiv className="bg-primary">
        <div className="p-6 rounded-lg shadow-md bg-white/10 backdrop-blur-md">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </CenterDiv>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute
