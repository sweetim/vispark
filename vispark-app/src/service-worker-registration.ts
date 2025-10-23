// @ts-nocheck - virtual:pwa-register is a Vite virtual module
import { registerSW } from "virtual:pwa-register";

// Service worker registration with better mobile support
export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    const updateSW = registerSW({
      onOfflineReady() {
        console.log("App ready to work offline");
        // You can show a custom notification here
      },
      onNeedRefresh() {
        console.log("New content available, please refresh");
        // You can show a custom notification here
      },
      onRegisteredSW(
        swScriptUrl: string,
        registration: ServiceWorkerRegistration | undefined,
      ) {
        console.log("Service worker registered:", swScriptUrl);

        // Check for updates periodically
        if (registration) {
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour
        }
      },
      onRegisterError(error: any) {
        console.error("Service worker registration error:", error);
      },
    });

    return updateSW;
  }

  return null;
}

// Handle PWA installation prompt
export function handleInstallPrompt() {
  let deferredPrompt: any = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("Install prompt ready");
  });

  return {
    promptInstall: async () => {
      if (!deferredPrompt) return false;

      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;

      return outcome === "accepted";
    },
    isPromptAvailable: () => !!deferredPrompt,
  };
}

// Check if app is running in standalone mode (PWA)
export function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

// Handle app installed event
window.addEventListener("appinstalled", () => {
  console.log("PWA was installed");
  // You can track this event for analytics
});
