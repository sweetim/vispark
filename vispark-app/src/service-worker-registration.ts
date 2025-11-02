// @ts-nocheck - virtual:pwa-register is a Vite virtual module
import { registerSW } from "virtual:pwa-register"

// Service worker registration with better mobile support
export function registerServiceWorker() {
  // Check if service workers are supported and if we're in a production environment
  if (
    "serviceWorker" in navigator
    && (import.meta.env.PROD || window.location.hostname === "localhost")
  ) {
    const updateSW = registerSW({
      onOfflineReady() {
        console.log("App ready to work offline")
        // Show a notification to the user that the app is ready for offline use
        if (
          window.confirm(
            "App is ready to work offline! Would you like to reload to ensure everything is cached?",
          )
        ) {
          window.location.reload()
        }
      },
      onNeedRefresh() {
        console.log("New content available, please refresh")
        // Show a more user-friendly notification for mobile
        if (
          window.confirm(
            "New content available. Would you like to update the app?",
          )
        ) {
          console.log("User chose to update the app")
        }
      },
      onRegisteredSW(
        swScriptUrl: string,
        registration: ServiceWorkerRegistration | undefined,
      ) {
        console.log("Service worker registered at:", swScriptUrl)

        // Check for updates periodically (more frequently for better UX)
        if (registration) {
          setInterval(
            () => {
              registration.update()
            },
            30 * 60 * 1000,
          ) // Check every 30 minutes instead of hourly

          // Also check when the user comes back to the app
          document.addEventListener("visibilitychange", () => {
            if (!document.hidden && registration) {
              registration.update()
            }
          })
        }
      },
      onRegisterError(error: any) {
        console.error("Service worker registration error:", error)
        // Show a more helpful error message
        console.warn(
          "PWA features may not be available. Make sure you're using HTTPS in production.",
        )
      },
    })

    return updateSW
  } else {
    console.warn("Service workers are not supported or not in a secure context")
  }

  return null
}

// Handle PWA installation prompt
export function handleInstallPrompt() {
  let deferredPrompt: any = null

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    deferredPrompt = e
    console.log("Install prompt ready")
  })

  return {
    promptInstall: async () => {
      if (!deferredPrompt) return false

      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      deferredPrompt = null

      return outcome === "accepted"
    },
    isPromptAvailable: () => !!deferredPrompt,
  }
}

// Check if app is running in standalone mode (PWA)
export function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches
    || (window.navigator as any).standalone === true
    || document.referrer.includes("android-app://")
  )
}

// Handle app installed event
window.addEventListener("appinstalled", () => {
  console.log("PWA was installed")
  // You can track this event for analytics
})
