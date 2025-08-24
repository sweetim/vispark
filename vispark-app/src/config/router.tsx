import { createBrowserRouter } from "react-router"
import {
  AppRootPage,
  ChannelPage,
  RootPage,
  SearchPage,
  SummariesPage,
} from "@/routes"

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
          {
            path: "search",
            element: <SearchPage />,
          },
        ],
      },
    ],
  },
])
