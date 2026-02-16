import { MantineProvider, type MantineThemeOverride } from "@mantine/core";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import "./style.css";
import { createBrowserRouter, Navigate } from "react-router";
import { App } from "./app.tsx";
import { route } from "./globals/route.ts";

if (import.meta.env.DEV) {
  window.addEventListener("unhandledrejection", ({ reason }) => {
    if (reason instanceof Error) {
      console.error(reason.message);
    }
  });

  window.addEventListener("error", ({ error }) => {
    if (error instanceof Error) {
      console.error(error.message);
    }
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found!");
}

export const theme = {} as const satisfies MantineThemeOverride;

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // biome-ignore lint/style/useNamingConvention: 3-rd party type
    HydrateFallback: () => null,
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
      {
        path: route.split,
        lazy: () =>
          import("./pages/split.page.tsx").then((m) => ({
            // biome-ignore lint/style/useNamingConvention: 3-rd party type
            Component: m.SplitPage,
          })),
      },
      {
        path: route.merge,
        lazy: () =>
          import("./pages/merge.page.tsx").then((m) => ({
            // biome-ignore lint/style/useNamingConvention: 3-rd party type
            Component: m.MergePage,
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
