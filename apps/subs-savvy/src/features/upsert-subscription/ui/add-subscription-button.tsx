import { ActionIcon, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "../../../shared/ui/icon.tsx";
import { useBreakpoint } from "../../../shared/ui/use-breakpoint.tsx";
import { useUpsertSubscriptionActions } from "../model/upsert-subscription.store.tsx";

export const AddSubscriptionButton = memo(() => {
  const { open } = useUpsertSubscriptionActions();
  const isMd = useBreakpoint("md");
  const { t } = useTranslation();

  const openSubscriptionInsert = useCallback(() => open(), [open]);

  return isMd ? (
    <Button onClick={openSubscriptionInsert}>{t("add-sub")}</Button>
  ) : (
    <ActionIcon
      onClick={openSubscriptionInsert}
      size="xl"
      radius="xl"
      aria-label={t("add-sub")}
    >
      <Icon
        icon={IconPlus}
        size="2em"
      />
    </ActionIcon>
  );
});
