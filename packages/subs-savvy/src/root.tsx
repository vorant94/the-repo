import {
  Card,
  Drawer,
  MantineProvider,
  type MantineThemeOverride,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import {
  IconChartBar,
  IconCreditCard,
  IconDatabase,
} from "@tabler/icons-react";
import { type FC, memo } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { CategoriesProvider } from "./entities/category/model/categories.store.tsx";
import { SubscriptionsProvider } from "./entities/subscription/model/subscriptions.store.tsx";
import { ImportRecoveryProvider } from "./features/import-recovery/model/import-recovery.store.tsx";
import { UpsertSubscriptionProvider } from "./features/upsert-subscription/model/upsert-subscription.store.tsx";
import { rootRoute } from "./shared/lib/route.ts";
import { type NavLink, NavLinksProvider } from "./shared/lib/use-nav-links.tsx";
import { cn } from "./shared/ui/cn.ts";
import { DefaultLayoutProvider } from "./shared/ui/default.layout.tsx";
import { Icon } from "./shared/ui/icon.tsx";
import { BreakpointsProvider } from "./shared/ui/use-breakpoint.tsx";
import "./style.css";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/root.ts";

export default memo(() => {
  const { i18n } = useTranslation();

  return (
    <html
      lang={i18n.language}
      dir={i18n.dir()}
    >
      <head>
        <meta charSet="UTF-8" />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/favicon.svg"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>Subs Savvy</title>
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Notifications />

          <NavLinksProvider
            topNavLinks={topNavLinks}
            bottomNavLinks={bottomNavLinks}
          >
            <BreakpointsProvider>
              <DefaultLayoutProvider>
                <UpsertSubscriptionProvider>
                  <CategoriesProvider>
                    <SubscriptionsProvider>
                      <ImportRecoveryProvider>
                        <Outlet />
                      </ImportRecoveryProvider>
                    </SubscriptionsProvider>
                  </CategoriesProvider>
                </UpsertSubscriptionProvider>
              </DefaultLayoutProvider>
            </BreakpointsProvider>
          </NavLinksProvider>
        </MantineProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}) satisfies FC<Route.ComponentProps>;

const theme = {
  components: {
    // biome-ignore lint/style/useNamingConvention: 3-rd party type
    Card: Card.extend({
      defaultProps: {
        padding: "lg",
        radius: "md",
      },
    }),
    // biome-ignore lint/style/useNamingConvention: 3-rd party type
    Drawer: Drawer.extend({
      classNames: {
        content: cn("flex flex-col"),
        body: cn("flex flex-1 flex-col"),
      },
    }),
  },
} as const satisfies MantineThemeOverride;

const topNavLinks = [
  {
    label: "dashboard",
    path: `/${rootRoute.dashboard}`,
    icon: <Icon icon={IconChartBar} />,
  },
  {
    label: "subscriptions",
    path: `/${rootRoute.subscriptions}`,
    icon: <Icon icon={IconCreditCard} />,
  },
] as const satisfies Array<NavLink>;

const bottomNavLinks = [
  {
    label: "recovery",
    path: `/${rootRoute.recovery}`,
    icon: <Icon icon={IconDatabase} />,
  },
] as const satisfies Array<NavLink>;
