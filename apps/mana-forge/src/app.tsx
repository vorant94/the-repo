import { Outlet } from "react-router";
import { DefaultLayout } from "./layouts/default.layout.tsx";

export function App() {
  return (
    <DefaultLayout>
      <Outlet />
    </DefaultLayout>
  );
}
