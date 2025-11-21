/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { execSync } from "child_process";

// Get git commit hash for version info
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const getGitCommitHash = () => {
  try {
    return execSync('git rev-parse --short HEAD', {
      encoding: 'utf-8'
    }).trim();
  } catch (error) {
    console.error('Failed to get git commit hash:', error);
    return 'unknown';
  }
};

// Get current build time
const getBuildTime = () => {
  return new Date().toISOString().split('T')[0];
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: "autoUpdate",
    injectRegister: "auto",
    strategies: "generateSW",
    filename: "sw.js",
    pwaAssets: {
      disabled: false,
      config: true,
      includeHtmlHeadLinks: true
    },
    manifest: {
      name: "vispark - AI Video Summaries",
      short_name: "vispark",
      description: "AI-powered video summaries and transcripts",
      theme_color: "#101828",
      background_color: "#101828",
      display: "standalone",
      // display_override: ["window-controls-overlay", "standalone"],
      orientation: "portrait-primary",
      scope: "/",
      start_url: "/",
      icons: [{
        src: "pwa-64x64.png",
        sizes: "64x64",
        type: "image/png"
      }, {
        src: "pwa-192x192.png",
        sizes: "192x192",
        type: "image/png"
      }, {
        src: "pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }, {
        src: "maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }],
      lang: "en",
      dir: "ltr",
      categories: ["productivity", "utilities", "education"]
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,svg,png,ico,jpg,jpeg,json,webmanifest,woff,woff2,ttf}"],
      navigateFallback: "/index.html",
      navigateFallbackDenylist: [/^\/api/],
      runtimeCaching: [{
        urlPattern: /^https:\/\/api\./i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          networkTimeoutSeconds: 3,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
          }
        }
      }, {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "images-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30 // <== 30 days
          }
        }
      }, {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/css/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-fonts-stylesheets",
          expiration: {
            maxEntries: 5,
            maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
          }
        }
      }, {
        urlPattern: /^https:\/\/fonts\.gstatic\.com/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-webfonts",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
          }
        }
      }],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true
    },
    devOptions: {
      enabled: true,
      navigateFallback: "index.html",
      suppressWarnings: true,
      type: "module"
    }
  })],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  define: {
    '__GIT_COMMIT_HASH__': JSON.stringify(getGitCommitHash()),
    '__BUILD_TIME__': JSON.stringify(getBuildTime())
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.ts']
      }
    }]
  }
});
