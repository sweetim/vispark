import { Spin, theme } from "antd"
import type { FC, ReactElement } from "react"
import { Navigate } from "@tanstack/react-router"

import CenterDiv from "@/modules/common/CenterDiv.tsx"
import { useAuth } from "./useAuth.ts"

type ProtectedRouteProps = {
  children: ReactElement
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  if (loading) {
    return (
      <CenterDiv className="bg-primary">
        <div
          className="p-6 rounded-lg shadow-md"
          style={{ backgroundColor: colorBgContainer }}
        >
          <Spin size="large" />
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
