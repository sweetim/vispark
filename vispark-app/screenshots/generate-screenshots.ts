import { spawn } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import {
  type Browser,
  type BrowserContext,
  chromium,
  type Page,
} from "playwright";

// Configuration for screenshots
const SCREENSHOTS_DIR = path.join(process.cwd(), "public", "screenshots");
const APP_URL = "http://localhost:5173";
const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 }, // iPhone X
  { name: "tablet", width: 768, height: 1024 }, // iPad
  { name: "desktop", width: 1280, height: 720 }, // Desktop
];

// Pages to capture
const PAGES_TO_CAPTURE = [
  {
    path: "/",
    name: "landing",
    description: "Landing page with hero section",
    waitSelector: ".min-h-screen", // Wait for main content
  },
  {
    path: "/login",
    name: "login",
    description: "Login page",
    waitSelector: "form",
  },
  {
    path: "/signup",
    name: "signup",
    description: "Sign up page",
    waitSelector: "form",
  },
  {
    path: "/app/vispark/search",
    name: "search",
    description: "Video search page",
    waitSelector: "form",
  },
  {
    path: "/app/summaries",
    name: "summaries",
    description: "Summaries archive page",
    waitSelector: ".relative.min-h-screen",
  },
];

async function ensureScreenshotsDir() {
  if (!existsSync(SCREENSHOTS_DIR)) {
    mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

async function startDevServer() {
  try {
    console.log("Starting development server...");

    // Start dev server in background
    const devServer = spawn("npm", ["run", "dev"], {
      stdio: "pipe",
      detached: false,
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log("Development server started");

    return devServer;
  } catch (error) {
    console.error("Failed to start dev server:", error);
    throw error;
  }
}

async function captureScreenshots() {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;

  try {
    // Ensure screenshots directory exists
    await ensureScreenshotsDir();

    // Launch browser
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();

    for (const viewport of VIEWPORTS) {
      console.log(
        `Capturing screenshots for ${viewport.name} viewport (${viewport.width}x${viewport.height})`,
      );

      // Create context with specific viewport
      const viewportContext = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 2,
      });

      for (const pageConfig of PAGES_TO_CAPTURE) {
        console.log(
          `  Capturing: ${pageConfig.name} - ${pageConfig.description}`,
        );

        const page: Page = await viewportContext.newPage();

        try {
          // Navigate to page
          await page.goto(`${APP_URL}${pageConfig.path}`, {
            waitUntil: "networkidle",
            timeout: 30000,
          });

          // Wait for specific selector to ensure content is loaded
          if (pageConfig.waitSelector) {
            await page.waitForSelector(pageConfig.waitSelector, {
              timeout: 10000,
            });
          }

          // Wait a bit more for any animations
          await page.waitForTimeout(2000);

          // Capture full page screenshot
          const filename = `${pageConfig.name}-${viewport.name}.png`;
          const filepath = path.join(SCREENSHOTS_DIR, filename);

          await page.screenshot({
            path: filepath,
            fullPage: true,
            quality: 90,
          });

          console.log(`    Saved: ${filename}`);
        } catch (error) {
          console.error(`    Failed to capture ${pageConfig.name}:`, error);
        } finally {
          await page.close();
        }
      }

      await viewportContext.close();
    }

    console.log("All screenshots captured successfully!");
  } catch (error) {
    console.error("Screenshot capture failed:", error);
    throw error;
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

async function generateScreenshots() {
  try {
    console.log("📸 Starting screenshot generation for PWA...");

    // Check if dev server is already running
    try {
      await fetch(APP_URL);
      console.log("Development server is already running");
    } catch {
      await startDevServer();
    }

    await captureScreenshots();

    console.log("✅ Screenshots generated successfully!");
    console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);

    // Generate a manifest entry for screenshots
    const screenshotsManifest = VIEWPORTS.flatMap((viewport) =>
      PAGES_TO_CAPTURE.map((page) => ({
        src: `screenshots/${page.name}-${viewport.name}.png`,
        sizes: `${viewport.width}x${viewport.height}`,
        type: "image/png",
        form_factor: viewport.name === "mobile" ? "narrow" : "wide",
        label: `${page.description} (${viewport.name})`,
      }))
    );

    // Save screenshots manifest
    const manifestPath = path.join(SCREENSHOTS_DIR, "screenshots.json");
    writeFileSync(
      manifestPath,
      JSON.stringify(screenshotsManifest, null, 2),
    );
    console.log("📋 Screenshots manifest saved to:", manifestPath);
  } catch (err) {
    console.error("❌ Failed to generate screenshots:", err);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateScreenshots();
}

export { generateScreenshots };
