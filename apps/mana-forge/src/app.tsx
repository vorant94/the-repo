import type { FC } from "react";
import { Outlet } from "react-router";
import { DefaultLayout } from "./layouts/default.layout.tsx";

export const App: FC = () => {
  return (
    <DefaultLayout>
      <Outlet />
    </DefaultLayout>
  );
};
