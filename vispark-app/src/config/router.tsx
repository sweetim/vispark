import { createBrowserRouter } from "react-router"
import {
  AppRootPage,
  ChannelPage,
  LandingPage,
  LoginPage,
  RootPage,
  SignUpPage,
  SummariesPage,
  VisparkPage,
  SettingsPage,
} from "@/routes"
import { ProtectedRoute } from "@/modules/auth"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootPage />,
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
        path: "app",
        element: (
          <ProtectedRoute>
            <AppRootPage />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <SummariesPage />,
          },
          {
            path: "channel",
            element: <ChannelPage />,
          },
          {
            path: "vispark",
            element: <VisparkPage />,
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
