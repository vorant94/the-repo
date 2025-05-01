import { Button, Stepper } from "@mantine/core";
import { cn } from "cn";
import { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useImportRecovery, useStore } from "../../../shared/store/hooks.ts";
import type { ImportRecoveryStage } from "../../../shared/store/types.ts";
import { ImportRecoveryDropZone } from "./import-recovery-drop-zone.tsx";
import { InsertCategoriesTable } from "./insert-categories-table.tsx";
import { InsertSubscriptionsTable } from "./insert-subscriptions-table.tsx";

export const ImportRecovery = memo(() => {
  const { importStage, subscriptionsToImport, categoriesToImport } =
    useImportRecovery();

  const [subscriptionsFormId, setSubscriptionsFormId] = useState("");
  const updateSubscriptionsFormId: (ref: HTMLFormElement | null) => void =
    useCallback(
      (ref) => setSubscriptionsFormId(ref?.getAttribute("id") ?? ""),
      [],
    );

  const [categoriesFormId, setCategoriesFormId] = useState("");
  const updateCategoriesFormId: (ref: HTMLFormElement | null) => void =
    useCallback(
      (ref) => setCategoriesFormId(ref?.getAttribute("id") ?? ""),
      [],
    );

  const [active, setActive] = useState(0);
  useEffect(() => setActive(stageToActive[importStage]), [importStage]);

  const { t } = useTranslation();

  return (
    <Stepper active={active}>
      <Stepper.Step label={t("upload-recovery")}>
        <div className={cn("flex flex-col")}>
          <ImportRecoveryDropZone
            onRecoveryParsed={useStore.getState().goNextFromUploadRecovery}
          />
        </div>
      </Stepper.Step>
      <Stepper.Step label={t("submit-categories")}>
        <div className={cn("flex flex-col gap-2")}>
          <InsertCategoriesTable
            categories={categoriesToImport}
            ref={updateCategoriesFormId}
            onSubmit={useStore.getState().goNextFromSubmitCategories}
          />

          <Button
            className={cn("self-end")}
            form={categoriesFormId}
            type="submit"
          >
            {t("submit")}
          </Button>
        </div>
      </Stepper.Step>
      <Stepper.Step label={t("submit-subscriptions")}>
        <div className={cn("flex flex-col gap-2")}>
          <InsertSubscriptionsTable
            subscriptions={subscriptionsToImport}
            categories={categoriesToImport}
            ref={updateSubscriptionsFormId}
            onSubmit={useStore.getState().goNextFromSubmitSubscriptions}
          />

          <Button
            className={cn("self-end")}
            form={subscriptionsFormId}
            type="submit"
          >
            {t("submit")}
          </Button>
        </div>
      </Stepper.Step>
      <Stepper.Completed>completed/failed</Stepper.Completed>
    </Stepper>
  );
});

const stageToActive = {
  "upload-recovery": 0,
  "submit-categories": 1,
  "submit-subscriptions": 2,
  failed: 3,
  completed: 3,
} satisfies Record<ImportRecoveryStage, number>;
