import { createBrowserRouter, Navigate } from "react-router";
import { rootRoute } from "../../shared/lib/route.ts";
import { App } from "../ui/app.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    // biome-ignore lint/style/useNamingConvention: 3-rd party type
    Component: App,
    children: [
      {
        path: "/",
        element: (
          <Navigate
            to={`/${rootRoute.dashboard}`}
            replace
          />
        ),
      },
      {
        path: `/${rootRoute.dashboard}`,
        lazy: () =>
          import("../../pages/dashboard/ui/dashboard.page.tsx").then((m) => ({
            // biome-ignore lint/style/useNamingConvention: 3-rd party type
            Component: m.DashboardPage,
          })),
      },
      {
        path: `/${rootRoute.subscriptions}`,
        lazy: () =>
          import("../../pages/subscription/ui/subscriptions.page.tsx").then(
            (m) => ({
              // biome-ignore lint/style/useNamingConvention: 3-rd party type
              Component: m.SubscriptionsPage,
            }),
          ),
      },
      {
        path: `/${rootRoute.recovery}`,
        lazy: () =>
          import("../../pages/recovery/ui/recovery.page.tsx").then((m) => ({
            // biome-ignore lint/style/useNamingConvention: 3-rd party type
            Component: m.RecoveryPage,
          })),
      },
    ],
  },
]);
