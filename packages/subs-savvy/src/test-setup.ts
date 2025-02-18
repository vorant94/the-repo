import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import "fake-indexeddb/auto";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { afterEach, expect, vi } from "vitest";
import { dateMatchers } from "./shared/test/date.matchers.ts";
// temp disable, see https://github.com/JoshuaKGoldberg/console-fail-test/issues/36
// import "console-fail-test/setup";

// react testing library
afterEach(() => {
  cleanup();
});

// mantine
const { getComputedStyle } = window;
window.getComputedStyle = (elt) => getComputedStyle(elt);
window.HTMLElement.prototype.scrollIntoView = () => {};

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserverStub implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverStub;

// custom matchers
expect.extend(dateMatchers);

// i18next
i18next.use(initReactI18next).init({
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  resources: {
    en: {
      translation: {},
    },
  },
});
