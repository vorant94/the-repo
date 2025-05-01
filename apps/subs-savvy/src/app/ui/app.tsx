import {
  IconChartBar,
  IconCreditCard,
  IconDatabase,
} from "@tabler/icons-react";
import { memo, useMemo } from "react";
import { Helmet, type HtmlProps } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import { rootRoute } from "../../shared/lib/route.ts";
import {
  type NavLink,
  NavLinksProvider,
} from "../../shared/lib/use-nav-links.tsx";
import { StoreProvider } from "../../shared/store/store.provider.tsx";
import { DefaultLayoutProvider } from "../../shared/ui/default.layout.tsx";
import { Icon } from "../../shared/ui/icon.tsx";
import { BreakpointsProvider } from "../../shared/ui/use-breakpoint.tsx";

export const App = memo(() => {
  const { i18n } = useTranslation();

  const htmlAttributes: HtmlProps = useMemo(
    () => ({ dir: i18n.dir(), lang: i18n.language }),
    [i18n.dir, i18n.language],
  );

  return (
    <>
      <Helmet htmlAttributes={htmlAttributes} />

      <NavLinksProvider
        topNavLinks={topNavLinks}
        bottomNavLinks={bottomNavLinks}
      >
        <BreakpointsProvider>
          <DefaultLayoutProvider>
            <StoreProvider>
              <Outlet />
            </StoreProvider>
          </DefaultLayoutProvider>
        </BreakpointsProvider>
      </NavLinksProvider>
    </>
  );
});

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
