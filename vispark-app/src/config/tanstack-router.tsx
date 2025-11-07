import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
  type RootRoute,
} from '@tanstack/react-router'
import { z } from 'zod'

// Import components
import {
  RootLayout,
  AppLayout,
  AuthCallbackPage,
  LandingPage,
  LoginPage,
  SignUpPage,
  SummariesLayout,
  SummariesPage,
  ChannelLayout,
  ChannelSearchPage,
  ChannelPage,
  VisparkLayout,
  VisparkSearchPage,
  VisparkVideoPage,
  SettingsLayout,
  SettingsPage,
  ProfilePage,
  AccountPage,
  PreferencesPage,
  WalletLayout,
  WalletPage,
} from '@/routes'

// Root route
const rootRoute: RootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <div>Page not found</div>,
  errorComponent: ({ error }) => <div>Error: {error.message}</div>,
})

// Auth routes
const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  component: AuthCallbackPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignUpPage,
})

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})


// App route with authentication
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  beforeLoad: async () => {
    // We'll implement authentication check later
    // For now, just pass through
    return {}
  },
  component: AppLayout,
})

// Redirect index to summaries
const appIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  beforeLoad: async () => {
    throw redirect({ to: '/app/summaries' })
  },
})

// Summaries routes
const summariesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/summaries',
  component: SummariesLayout,
})

const summariesIndexRoute = createRoute({
  getParentRoute: () => summariesRoute,
  path: '/',
  component: SummariesPage,
})

// Channels routes
const channelsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/channels',
  component: ChannelLayout,
})

const channelsSearchRoute = createRoute({
  getParentRoute: () => channelsRoute,
  path: '/',
  component: ChannelSearchPage,
})

const channelsIdRoute = createRoute({
  getParentRoute: () => channelsRoute,
  path: '/$channelId',
  component: ChannelPage,
  parseParams: (rawParams) => {
    const channelId = rawParams.channelId
    // Validate channel ID format
    if (!channelId.match(/^[a-zA-Z0-9_-]+$/)) {
      throw new Error('Invalid channel ID format')
    }
    return { channelId }
  },
  stringifyParams: (params) => ({
    channelId: params.channelId,
  }),
})


// Videos routes
const videosRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/videos',
  component: VisparkLayout,
})

const videosSearchRoute = createRoute({
  getParentRoute: () => videosRoute,
  path: '/',
  component: VisparkSearchPage,
  validateSearch: (search: Record<string, string>) => ({
    q: z.string().optional().parse(search.q),
  }),
})

const videosIdRoute = createRoute({
  getParentRoute: () => videosRoute,
  path: '/$videoId',
  component: VisparkVideoPage,
  parseParams: (rawParams) => {
    const videoId = rawParams.videoId
    // Validate YouTube video ID format
    if (!videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      throw new Error('Invalid video ID format')
    }
    return { videoId }
  },
  stringifyParams: (params) => ({
    videoId: params.videoId,
  }),
})


// Settings routes
const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/settings',
  component: SettingsLayout,
})

const settingsIndexRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/',
  component: SettingsPage,
})

const settingsProfileRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/profile',
  component: ProfilePage,
})

const settingsAccountRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/account',
  component: AccountPage,
})

const settingsPreferencesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/preferences',
  component: PreferencesPage,
})

// Wallet routes
const walletRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/wallet',
  component: WalletLayout,
})

const walletIndexRoute = createRoute({
  getParentRoute: () => walletRoute,
  path: '/',
  component: WalletPage,
})

// Assemble route tree
const routeTree = rootRoute.addChildren([
  authCallbackRoute,
  loginRoute,
  signupRoute,
  landingRoute,
  appRoute.addChildren([
    appIndexRoute,
    summariesRoute.addChildren([summariesIndexRoute]),
    channelsRoute.addChildren([channelsSearchRoute, channelsIdRoute]),
    videosRoute.addChildren([videosSearchRoute, videosIdRoute]),
    settingsRoute.addChildren([
      settingsIndexRoute,
      settingsProfileRoute,
      settingsAccountRoute,
      settingsPreferencesRoute,
    ]),
    walletRoute.addChildren([walletIndexRoute]),
  ]),
])

// Create router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultStaleTime: 5 * 60 * 1000, // 5 minutes
})

// Register router for TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
