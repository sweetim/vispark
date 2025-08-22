import {
  AppRootPage,
  ChannelPage,
  RootPage,
  SummariesPage,
} from "@/routes"
import { createBrowserRouter } from "react-router"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootPage />,
    children: [
      {
        path: "app",
        element: (
          <AppRootPage />
          // <ProtectedRoute>
          // </ProtectedRoute>
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
        ],
      },
    ],
  },
])
