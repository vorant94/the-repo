import {
  AppShell,
  Burger,
  MantineProvider,
  type MantineThemeOverride,
  NavLink,
  Text,
} from "@mantine/core";
import { useDisclosure, usePrevious } from "@mantine/hooks";
import {
  IconFileTypeCsv,
  IconLayersIntersect,
  IconLayersUnion,
  IconShoppingCart,
} from "@tabler/icons-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { cn } from "cn";
import { type FC, type PropsWithChildren, useEffect } from "react";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import { queryClient } from "./globals/query-client.ts";
import { route } from "./globals/route.ts";
import "./style.css";

export const theme = {} as const satisfies MantineThemeOverride;

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en">
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
        <title>Mana Forge</title>
        <Meta />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <MantineProvider
            theme={theme}
            defaultColorScheme="auto"
          >
            {children}
          </MantineProvider>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

const App: FC = () => {
  const [isNavOpened, nav] = useDisclosure(false);
  const { pathname } = useLocation();
  const prevPathname = usePrevious(pathname);

  useEffect(() => {
    if (pathname === prevPathname) {
      return;
    }

    nav.close();
  }, [nav, pathname, prevPathname]);

  const navigationItems = [
    { label: "Split", path: route.split, icon: <IconFileTypeCsv /> },
    { label: "Compare", path: route.compare, icon: <IconLayersIntersect /> },
    { label: "Merge", path: route.merge, icon: <IconLayersUnion /> },
    { label: "Pick", path: route.pick, icon: <IconShoppingCart /> },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 200,
        breakpoint: "sm",
        collapsed: { mobile: !isNavOpened },
      }}
      padding="md"
    >
      <AppShell.Header className={cn("flex items-center gap-2 px-4")}>
        <Burger
          opened={isNavOpened}
          onClick={nav.toggle}
          hiddenFrom="sm"
          size="sm"
        />
        <Text
          component={Link}
          to={route.home}
          className={cn("font-bold")}
        >
          Mana Forge
        </Text>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ol className={cn("flex flex-1 flex-col")}>
          {navigationItems.map((item) => (
            <li key={item.path}>
              <NavLink
                component={Link}
                to={item.path}
                label={item.label}
                leftSection={item.icon}
                active={pathname.startsWith(item.path)}
              />
            </li>
          ))}
        </ol>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default App;
