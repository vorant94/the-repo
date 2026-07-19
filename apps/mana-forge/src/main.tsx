import { MantineProvider, type MantineThemeOverride } from "@mantine/core";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import "./style.css";
import { createBrowserRouter, Navigate } from "react-router";
import { App } from "./app.tsx";
import { queryClient } from "./globals/query-client.ts";
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
      {
        path: route.compare,
        lazy: () =>
          import("./pages/compare.page.tsx").then((m) => ({
            // biome-ignore lint/style/useNamingConvention: 3-rd party type
            Component: m.ComparePage,
          })),
      },
      {
        path: route.pick,
        lazy: () =>
          import("./pages/pick.page.tsx").then((m) => ({
            // biome-ignore lint/style/useNamingConvention: 3-rd party type
            Component: m.PickPage,
          })),
      },
    ],
  },
]);

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        theme={theme}
        defaultColorScheme="auto"
      >
        <RouterProvider router={router} />
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
);
