import { createBrowserRouter, Navigate } from "react-router"
import { ProtectedRoute } from "@/modules/auth"
import {
  AppLayout,
  AuthCallbackPage,
  ChannelLayout,
  ChannelPage,
  ChannelSearchPage,
  LandingPage,
  LoginPage,
  RootLayout,
  SettingsPage,
  SignUpPage,
  SummariesPage,
  VisparkLayout,
  VisparkSearchPage,
  VisparkVideoPage,
} from "@/routes"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "signup",
        element: <SignUpPage />,
      },
      {
        path: "auth/callback",
        element: <AuthCallbackPage />,
      },
      {
        path: "app",
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <SummariesPage />,
          },
          {
            path: "channel",
            element: <ChannelLayout />,
            children: [
              {
                index: true,
                element: (
                  <Navigate
                    to="search"
                    replace
                  />
                ),
              },
              {
                path: "search",
                element: <ChannelSearchPage />,
              },
              {
                path: ":channelId",
                element: <ChannelPage />,
              },
            ],
          },
          {
            path: "vispark",
            element: <VisparkLayout />,
            children: [
              {
                index: true,
                element: (
                  <Navigate
                    to="search"
                    replace
                  />
                ),
              },
              {
                path: "search",
                element: <VisparkSearchPage />,
              },
              {
                path: "search/:videoId",
                element: <VisparkVideoPage />,
              },
            ],
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
])
