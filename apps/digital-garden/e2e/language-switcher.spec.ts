import { expect, test } from "@playwright/test";

test(
  "redirect from root to default lang",
  { tag: ["@desktop"] },
  async ({ page }) => {
    await page.goto("/");

    // otherwise expect below fails in CI/CD of GitHub actions
    await page.waitForLoadState("networkidle");

    const url = new URL(page.url());

    expect(url.pathname).toEqual("/en");
  },
);

test(
  "swap language and stay at the same page if its not post page",
  { tag: ["@desktop"] },
  async ({ page }) => {
    await page.goto("/en/posts");

    await page.getByRole("button", { name: "switch to ru" }).click();

    const url = new URL(page.url());

    expect(url.pathname).toEqual("/ru/posts");
  },
);

test(
  "swap language and stay at the same page if its post page that has translation",
  { tag: ["@desktop"] },
  async ({ page }) => {
    await page.goto("/en/posts/why-brave-new-world-is-actually-a-utopia");

    await page.getByRole("button", { name: "switch to ru" }).click();

    const url = new URL(page.url());

    expect(url.pathname).toEqual(
      "/ru/posts/why-brave-new-world-is-actually-a-utopia",
    );
  },
);

test(
  "swap language and redirect to home if its post page that has no translation",
  { tag: ["@desktop"] },
  async ({ page }) => {
    await page.goto("/en/posts/divide-and-conquer-right-concerns-to-separate");

    await page.getByRole("button", { name: "switch to ru" }).click();

    const url = new URL(page.url());

    expect(url.pathname).toEqual("/ru");
  },
);
