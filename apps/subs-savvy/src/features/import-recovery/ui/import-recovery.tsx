import { cn } from "@/shared/ui/cn.ts";
import { Button, Stepper } from "@mantine/core";
import { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  type ImportRecoveryStateStage,
  useImportRecovery,
  useImportRecoveryActions,
} from "../model/import-recovery.store.tsx";
import { ImportRecoveryDropZone } from "./import-recovery-drop-zone.tsx";
import { InsertCategoriesTable } from "./insert-categories-table.tsx";
import { InsertSubscriptionsTable } from "./insert-subscriptions-table.tsx";

// TODO improve performance (parsing a lot of sub makes UI lag)
export const ImportRecovery = memo(() => {
  const { stage, subscriptions, categories } = useImportRecovery();
  const {
    goNextFromUploadRecovery,
    goNextFromSubmitCategories,
    goNextFromSubmitSubscriptions,
  } = useImportRecoveryActions();

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
  useEffect(() => setActive(stageToActive[stage]), [stage]);

  const { t } = useTranslation();

  return (
    <Stepper active={active}>
      <Stepper.Step label={t("upload-recovery")}>
        <div className={cn("flex flex-col")}>
          <ImportRecoveryDropZone onRecoveryParsed={goNextFromUploadRecovery} />
        </div>
      </Stepper.Step>
      <Stepper.Step label={t("submit-categories")}>
        <div className={cn("flex flex-col gap-2")}>
          <InsertCategoriesTable
            categories={categories}
            ref={updateCategoriesFormId}
            onSubmit={goNextFromSubmitCategories}
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
            subscriptions={subscriptions}
            categories={categories}
            ref={updateSubscriptionsFormId}
            onSubmit={goNextFromSubmitSubscriptions}
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
      <Stepper.Completed>
        {/*TODO implement UI here*/}
        completed/failed
      </Stepper.Completed>
    </Stepper>
  );
});

const stageToActive = {
  "upload-recovery": 0,
  "submit-categories": 1,
  "submit-subscriptions": 2,
  failed: 3,
  completed: 3,
} satisfies Record<ImportRecoveryStateStage, number>;
