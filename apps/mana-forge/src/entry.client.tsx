import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

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

hydrateRoot(
  document,
  <StrictMode>
    <HydratedRouter />
  </StrictMode>,
);
