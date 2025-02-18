import type { Alpine } from "alpinejs";

declare module "alpinejs" {
  interface DefaultLayoutStore {
    isMobileNavOpen: boolean;
    closeMobileNav(): void;
    openMobileNav(): void;
  }

  interface Stores {
    defaultLayout: DefaultLayoutStore;
  }
}

// biome-ignore lint/style/noDefaultExport: 3-rd party API
export default (alpine: Alpine) => {
  document.addEventListener("alpine:init", () => {
    alpine.store("defaultLayout", {
      isMobileNavOpen: false,
      openMobileNav() {
        document.body.classList.add("overflow-y-hidden");
        this.isMobileNavOpen = true;
      },
      closeMobileNav() {
        document.body.classList.remove("overflow-y-hidden");
        this.isMobileNavOpen = false;
      },
    });
  });

  window.addEventListener("resize", () => {
    const width = document.documentElement.clientWidth;
    const defaultLayout = alpine.store("defaultLayout");
    if (width < 1024 || !defaultLayout.isMobileNavOpen) {
      return;
    }

    alpine.store("defaultLayout").closeMobileNav();
  });

  document.addEventListener("astro:before-preparation", () => {
    const defaultLayout = alpine.store("defaultLayout");
    if (!defaultLayout.isMobileNavOpen) {
      return;
    }

    alpine.store("defaultLayout").closeMobileNav();
  });
};
