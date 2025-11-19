import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"

import { router } from "@/config/tanstack-router.tsx"
import { AuthProvider } from "@/modules/auth"
import { SWRProvider } from "@/config/swrConfig"
import { LocaleProvider } from "@/contexts/LocaleContext"
import "@/config/i18n"
import { registerServiceWorker } from "./service-worker-registration"
import "./index.css"

// Register service worker for better mobile PWA support
registerServiceWorker()

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SWRProvider>
      <AuthProvider>
        <LocaleProvider>
          <RouterProvider router={router} />
        </LocaleProvider>
      </AuthProvider>
    </SWRProvider>
  </StrictMode>,
)
