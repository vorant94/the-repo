import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import i18next from "i18next";
import i18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import i18nextFetchBackend from "i18next-fetch-backend";
import { HMRPlugin } from "i18next-hmr/plugin";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initReactI18next } from "react-i18next";
import { RouterProvider } from "react-router/dom";
import { router } from "./app/providers/router.tsx";
import { theme } from "./app/providers/theme.tsx";
import {
  defaultLanguage,
  supportedLanguages,
} from "./features/i18n/model/use-language.ts";
import { db } from "./shared/lib/db.ts";
import "./style.css";
import { HelmetProvider } from "react-helmet-async";

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

// setting it to the window so db is easily accessible to populate it with data during e2e tests
window.db = db;

const i18n = i18next
  .use(initReactI18next)
  .use(i18nextFetchBackend)
  .use(i18nextBrowserLanguageDetector);
if (import.meta.env.DEV) {
  i18n.use(
    new HMRPlugin({
      vite: {
        client: typeof window !== "undefined",
      },
    }),
  );
}

i18n.init({
  fallbackLng: defaultLanguage,
  supportedLngs: supportedLanguages,
  interpolation: { escapeValue: false },
  detection: {
    caches: [],
  },
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found!");
}

createRoot(rootElement).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />

      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </MantineProvider>
  </StrictMode>,
);
