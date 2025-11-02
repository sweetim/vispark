import { ConfigProvider, theme } from "antd"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"

import { router } from "@/config/router.tsx"
import { AuthProvider } from "@/modules/auth"
import { ToastProvider } from "@/contexts/ToastContext"
import { registerServiceWorker } from "./service-worker-registration"
import "./index.css"

// Register service worker for better mobile PWA support
registerServiceWorker()

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </ConfigProvider>
  </StrictMode>,
)
