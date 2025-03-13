import { expect, test } from "@playwright/test";

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
    const mobileNavBurger = page.getByRole("button", {
      name: "mobile-nav-burger",
    });
    const mobileNav = page.getByTestId("mobile-nav");
    const modalClose = page.getByRole("button", { name: "modal-close" });

    await expect(desktopNav, "should hide desktop nav").not.toBeVisible();
    await expect(
      mobileNavBurger,
      "should show mobile nav modal burger button",
    ).toBeVisible();

    await expect(
      modalClose,
      "should hide modal by default",
    ).not.toBeInViewport();
    await expect(
      mobileNav,
      "should hide mobile nav by default",
    ).not.toBeInViewport();

    await mobileNavBurger.click();

    await expect(
      modalClose,
      "should show modal after burger button is clicked",
    ).toBeInViewport();
    await expect(
      mobileNav,
      "should show mobile nav after burger button is clicked",
    ).toBeInViewport();

    await modalClose.click();

    await expect(
      mobileNav,
      "should hide modal after modal close button is clicked",
    ).not.toBeInViewport();
    await expect(
      modalClose,
      "should hide mobile nav after modal close button is clicked",
    ).not.toBeInViewport();
  },
);
