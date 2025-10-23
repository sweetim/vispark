import "./PWABadge.css"

import { useRegisterSW } from "virtual:pwa-register/react"
import { useEffect, useState } from "react"

function PWABadge() {
  // check for updates every hour
  const period = 60 * 60 * 1000
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
    offlineReady: [offlineReady, setOfflineReady],
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return
      if (r?.active?.state === "activated") {
        registerPeriodicSync(period, swUrl, r)
      } else if (r?.installing) {
        r.installing.addEventListener("statechange", (e) => {
          const sw = e.target as ServiceWorker
          if (sw.state === "activated") registerPeriodicSync(period, swUrl, r)
        })
      }
    },
  })

  // Handle PWA installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      )
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowInstallPrompt(false)

    if (outcome === "accepted") {
      console.log("PWA installation accepted")
    }
  }

  function close() {
    setNeedRefresh(false)
  }

  function closeOfflineReady() {
    setOfflineReady(false)
  }

  function closeInstallPrompt() {
    setShowInstallPrompt(false)
  }

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="PWABadge-toast PWABadge-install">
          <div className="PWABadge-message">
            <span>Install vispark for better experience</span>
          </div>
          <div className="PWABadge-buttons">
            <button
              type="button"
              className="PWABadge-toast-button PWABadge-install-button"
              onClick={handleInstallClick}
            >
              Install
            </button>
            <button
              type="button"
              className="PWABadge-toast-button"
              onClick={closeInstallPrompt}
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {/* Offline Ready Message */}
      {offlineReady && (
        <div className="PWABadge-toast PWABadge-offline">
          <div className="PWABadge-message">
            <span>App ready to work offline</span>
          </div>
          <div className="PWABadge-buttons">
            <button
              type="button"
              className="PWABadge-toast-button"
              onClick={closeOfflineReady}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Update Available Message */}
      {needRefresh && (
        <div className="PWABadge-toast PWABadge-update">
          <div className="PWABadge-message">
            <span>
              New content available, click on reload button to update.
            </span>
          </div>
          <div className="PWABadge-buttons">
            <button
              type="button"
              className="PWABadge-toast-button PWABadge-reload-button"
              onClick={() => updateServiceWorker(true)}
            >
              Reload
            </button>
            <button
              type="button"
              className="PWABadge-toast-button"
              onClick={close}
            >
              Later
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default PWABadge

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(
  period: number,
  swUrl: string,
  r: ServiceWorkerRegistration,
) {
  if (period <= 0) return

  setInterval(async () => {
    if ("onLine" in navigator && !navigator.onLine) return

    const resp = await fetch(swUrl, {
      cache: "no-store",
      headers: {
        cache: "no-store",
        "cache-control": "no-cache",
      },
    })

    if (resp?.status === 200) await r.update()
  }, period)
}
