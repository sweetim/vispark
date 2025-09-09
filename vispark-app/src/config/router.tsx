import { createBrowserRouter } from "react-router"
import {
  AppRootPage,
  ChannelPage,
  RootPage,
  SummariesPage,
  VisparkPage,
} from "@/routes"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootPage />,
    children: [
      {
        path: "",
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
            path: "vispark",
            element: <VisparkPage />,
          },
        ],
      },
    ],
  },
])
