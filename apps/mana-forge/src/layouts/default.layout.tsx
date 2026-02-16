import { AppShell, Burger, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { cn } from "cn";
import type { FC, PropsWithChildren } from "react";

export const DefaultLayout: FC<PropsWithChildren> = ({ children }) => {
  const [navOpened, nav] = useDisclosure(false);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 200,
        breakpoint: "sm",
        collapsed: { mobile: !navOpened },
      }}
      padding="md"
    >
      <AppShell.Header className={cn("flex items-center gap-2 px-4")}>
        <Burger
          opened={navOpened}
          onClick={nav.toggle}
          hiddenFrom="sm"
          size="sm"
        />
        <Text className={cn("font-bold")}>Mana Forge</Text>
      </AppShell.Header>

      <AppShell.Navbar p="md" />

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};
