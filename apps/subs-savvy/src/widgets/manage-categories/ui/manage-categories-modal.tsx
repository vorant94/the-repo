import { useCategories } from "@/entities/category/model/categories.store.tsx";
import { CategoryList } from "@/features/list-categories/ui/category-list.tsx";
import {
  useUpsertCategoryActions,
  useUpsertCategoryMode,
} from "@/features/upsert-category/model/upsert-category.store.tsx";
import { CategoryForm } from "@/features/upsert-category/ui/category-form.tsx";
import type { CategoryModel } from "@/shared/api/category.model.ts";
import { deleteCategory } from "@/shared/api/category.table.ts";
import { Button, Modal } from "@mantine/core";
import { cn } from "cn";
import { memo, useCallback, useEffect, useState } from "react";

export const ManageCategoriesModal = memo(
  ({ isOpen, close }: ManageCategoriesModalProps) => {
    const [mode, setMode] = useState<"view" | "upsert">("view");

    const categories = useCategories();

    const upsertMode = useUpsertCategoryMode();
    const upsertActions = useUpsertCategoryActions();
    const openCategoryInsert = useCallback(() => {
      setMode("upsert");
      upsertActions.open();
    }, [upsertActions.open]);
    const closeCategoryUpsert = useCallback(() => {
      setMode("view");
      upsertActions.close();
    }, [upsertActions.close]);

    const [formId, setFormId] = useState("");
    const updateFormId: (ref: HTMLFormElement | null) => void = useCallback(
      (ref) => setFormId(ref?.getAttribute("id") ?? ""),
      [],
    );

    useEffect(() => {
      if (!isOpen) {
        if (mode !== "view") {
          setMode("view");
        }

        if (upsertMode) {
          upsertActions.close();
        }
      }

      if (!upsertMode && mode !== "view") {
        setMode("view");
      }

      if (upsertMode && mode === "view") {
        setMode("upsert");
      }
    }, [isOpen, mode, upsertActions.close, upsertMode]);

    const { open } = useUpsertCategoryActions();
    const openCategoryUpdate = useCallback(
      (category: CategoryModel) => open(category),
      [open],
    );

    const handleDeleteCategory = useCallback(
      (category: CategoryModel) => deleteCategory(category.id),
      [],
    );

    return (
      <Modal
        opened={isOpen}
        onClose={close}
        title="Manage Categories"
      >
        <div className={cn("flex flex-col gap-2")}>
          {mode === "view" ? (
            <CategoryList
              categories={categories}
              onEditClick={openCategoryUpdate}
              onDeleteClick={handleDeleteCategory}
            />
          ) : (
            <CategoryForm ref={updateFormId} />
          )}

          <div className={cn("flex justify-end gap-2")}>
            {mode === "view" ? (
              <Button
                type="button"
                key="add-category"
                onClick={openCategoryInsert}
              >
                add category
              </Button>
            ) : (
              <Button
                type="submit"
                key="submit-category-form"
                form={formId}
              >
                {upsertMode === "update" ? "Update" : "Insert"}
              </Button>
            )}
            {mode !== "view" ? (
              <Button
                type="button"
                key="cancel-category-form"
                variant="outline"
                onClick={closeCategoryUpsert}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
      </Modal>
    );
  },
);

export interface ManageCategoriesModalProps {
  isOpen: boolean;
  close: () => void;
}
