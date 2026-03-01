import { AppShell, Burger, NavLink, Text } from "@mantine/core";
import { useDisclosure, usePrevious } from "@mantine/hooks";
import {
  IconBlendMode,
  IconFileTypeCsv,
  IconLayersIntersect,
} from "@tabler/icons-react";
import { cn } from "cn";
import {
  type FC,
  type PropsWithChildren,
  type ReactNode,
  useEffect,
} from "react";
import { Link, useLocation } from "react-router";
import { route } from "../globals/route.ts";

export const DefaultLayout: FC<PropsWithChildren> = ({ children }) => {
  const [isNavOpened, nav] = useDisclosure(false);
  const { pathname } = useLocation();
  const prevPathname = usePrevious(pathname);

  useEffect(() => {
    if (pathname === prevPathname) {
      return;
    }

    nav.close();
  }, [nav, pathname, prevPathname]);

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
          <DefaultLayoutNavLink
            label="Split"
            path={route.split}
            icon={<IconFileTypeCsv />}
          />
          <DefaultLayoutNavLink
            label="Merge"
            path={route.merge}
            icon={<IconBlendMode />}
          />
          <DefaultLayoutNavLink
            label="Compare"
            path={route.compare}
            icon={<IconLayersIntersect />}
          />
        </ol>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

interface DefaultLayoutNavLinkProps {
  label: string;
  path: string;
  icon: ReactNode;
}

const DefaultLayoutNavLink: FC<DefaultLayoutNavLinkProps> = ({
  label,
  path,
  icon,
}) => {
  const { pathname } = useLocation();

  return (
    <li>
      <NavLink
        component={Link}
        to={path}
        label={label}
        leftSection={icon}
        active={pathname.startsWith(path)}
      />
    </li>
  );
};
