import { type FC, memo } from "react";
import { Navigate } from "react-router";
import { rootRoute } from "../../../shared/lib/route.ts";
import type { Route } from "./+types/home.page.ts";

// TODO how to redirect without creating a dedicated blank page?
export default memo(() => {
  return (
    <Navigate
      to={`/${rootRoute.dashboard}`}
      replace={true}
    />
  );
}) satisfies FC<Route.ComponentProps>;
