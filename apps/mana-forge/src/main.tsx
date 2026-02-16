import { MantineProvider, type MantineThemeOverride } from "@mantine/core";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import "./style.css";
import { createBrowserRouter, Navigate } from "react-router";
import { App } from "./app.tsx";
import { route } from "./globals/route.ts";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found!");
}

export const theme = {} as const satisfies MantineThemeOverride;

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Navigate
            to={route.home}
            replace
          />
        ),
      },
      {
        path: route.home,
        lazy: () =>
          import("./pages/home.page.tsx").then((m) => ({
            // biome-ignore lint/style/useNamingConvention: 3-rd party type
            Component: m.HomePage,
          })),
      },
    ],
  },
]);

createRoot(rootElement).render(
  <StrictMode>
    <MantineProvider
      theme={theme}
      defaultColorScheme="auto"
    >
      <RouterProvider router={router} />
    </MantineProvider>
  </StrictMode>,
);
