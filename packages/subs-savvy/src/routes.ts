import { type RouteConfig, index, route } from "@react-router/dev/routes";
import { rootRoute } from "./shared/lib/route.ts";

export default [
  index("./pages/home/ui/home.page.tsx"),
  route(`/${rootRoute.dashboard}`, "./pages/dashboard/ui/dashboard.page.tsx"),
  route(
    `/${rootRoute.subscriptions}`,
    "./pages/subscription/ui/subscriptions.page.tsx",
  ),
  route(`/${rootRoute.recovery}`, "./pages/recovery/ui/recovery.page.tsx"),
] satisfies RouteConfig;
