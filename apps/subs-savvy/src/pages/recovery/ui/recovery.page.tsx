import { Card, Tabs } from "@mantine/core";
import { IconDownload, IconUpload } from "@tabler/icons-react";
import { cn } from "cn";
import { type FC, memo } from "react";
import { useTranslation } from "react-i18next";
import { ExportRecovery } from "../../../features/export-recovery/ui/export-recovery.tsx";
import { ImportRecovery } from "../../../features/import-recovery/ui/import-recovery.tsx";
import {
  DefaultLayout,
  DefaultLayoutHeader,
} from "../../../shared/ui/default.layout.tsx";
import { Icon } from "../../../shared/ui/icon.tsx";

export const RecoveryPage: FC = memo(() => {
  const { t } = useTranslation();

  return (
    <DefaultLayout header={<DefaultLayoutHeader />}>
      <Card>
        <Tabs
          className={cn("flex flex-col gap-2")}
          defaultValue={tab.import}
        >
          <Tabs.List>
            <Tabs.Tab
              value={tab.import}
              leftSection={<Icon icon={IconUpload} />}
            >
              {t("import")}
            </Tabs.Tab>
            <Tabs.Tab
              value={tab.export}
              leftSection={<Icon icon={IconDownload} />}
            >
              {t("export")}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value={tab.import}>
            <ImportRecovery />
          </Tabs.Panel>

          <Tabs.Panel value={tab.export}>
            <ExportRecovery />
          </Tabs.Panel>
        </Tabs>
      </Card>
    </DefaultLayout>
  );
});

const tab = {
  import: "import",
  export: "export",
} as const;
