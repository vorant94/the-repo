import { devices, expect, test } from "@playwright/test";

test(
  "has desktop navigation links",
  { tag: ["@desktop"] },
  async ({ page }) => {
    await page.goto("/");

    const desktopNav = page.getByTestId("desktop-nav");
    const mobileNavBurger = page.getByRole("button", {
      name: "mobile-nav-burger",
    });

    await expect(desktopNav).toBeVisible();
    await expect(mobileNavBurger).not.toBeVisible();
  },
);

test(
  "has mobile nav modal instead of desktop navigation links",
  { tag: ["@mobile"] },
  async ({ page }) => {
    await page.goto("/");

    const desktopNav = page.getByTestId("desktop-nav");
    const mobileNavOpen = page.getByRole("button", {
      name: "mobile-nav-open",
    });
    const mobileNav = page.getByTestId("mobile-nav");
    const mobileNavClose = page.getByRole("button", {
      name: "mobile-nav-close",
    });

    await expect(desktopNav, "should hide desktop nav").not.toBeVisible();
    await expect(
      mobileNavOpen,
      "should show mobile nav modal burger button",
    ).toBeVisible();

    await expect(
      mobileNavClose,
      "should hide modal by default",
    ).not.toBeInViewport();
    await expect(
      mobileNav,
      "should hide mobile nav by default",
    ).not.toBeInViewport();

    await mobileNavOpen.click();

    await expect(
      mobileNavClose,
      "should show modal after burger button is clicked",
    ).toBeInViewport();
    await expect(
      mobileNav,
      "should show mobile nav after burger button is clicked",
    ).toBeInViewport();

    await mobileNavClose.click();

    await expect(
      mobileNav,
      "should hide modal after modal close button is clicked",
    ).not.toBeInViewport();
    await expect(
      mobileNavClose,
      "should hide mobile nav after modal close button is clicked",
    ).not.toBeInViewport();
  },
);

test(
  "closes mobile nav on screen resize",
  { tag: ["@mobile"] },
  async ({ page }) => {
    await page.goto("/");

    const desktopNav = page.getByTestId("desktop-nav");
    const mobileNavOpen = page.getByRole("button", {
      name: "mobile-nav-open",
    });
    const mobileNav = page.getByTestId("mobile-nav");
    const mobileNavClose = page.getByRole("button", {
      name: "mobile-nav-close",
    });

    await expect(desktopNav, "should hide desktop nav").not.toBeVisible();
    await expect(
      mobileNavOpen,
      "should show mobile nav modal burger button",
    ).toBeVisible();

    await expect(
      mobileNavClose,
      "should hide modal by default",
    ).not.toBeInViewport();
    await expect(
      mobileNav,
      "should hide mobile nav by default",
    ).not.toBeInViewport();

    await mobileNavOpen.click();

    await expect(
      mobileNavClose,
      "should show modal after burger button is clicked",
    ).toBeInViewport();
    await expect(
      mobileNav,
      "should show mobile nav after burger button is clicked",
    ).toBeInViewport();

    await page.setViewportSize(devices["Desktop Chrome"].viewport);

    await expect(
      mobileNav,
      "should hide modal after modal close button is clicked",
    ).not.toBeInViewport();
    await expect(
      mobileNavClose,
      "should hide mobile nav after modal close button is clicked",
    ).not.toBeInViewport();
  },
);
