import { Button, Modal } from "@mantine/core";
import { cn } from "cn";
import { memo, useCallback, useEffect, useState } from "react";
import { CategoryList } from "../../../features/list-categories/ui/category-list.tsx";
import { CategoryForm } from "../../../features/upsert-category/ui/category-form.tsx";
import type { CategoryModel } from "../../../shared/api/category.model.ts";
import { deleteCategory } from "../../../shared/api/category.table.ts";
import {
  useCategories,
  useStore,
  useUpsertCategory,
} from "../../../shared/store/hooks.ts";

export const ManageCategoriesModal = memo(
  ({ isOpen, close }: ManageCategoriesModalProps) => {
    const [mode, setMode] = useState<"view" | "upsert">("view");

    const categories = useCategories();

    const { upsertCategoryMode } = useUpsertCategory();
    const openCategoryInsert = useCallback(() => {
      setMode("upsert");
      useStore.getState().openUpsertCategory();
    }, []);
    const closeCategoryUpsert = useCallback(() => {
      setMode("view");
      useStore.getState().closeUpsertCategory();
    }, []);

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

        if (upsertCategoryMode) {
          useStore.getState().closeUpsertCategory();
        }
      }

      if (!upsertCategoryMode && mode !== "view") {
        setMode("view");
      }

      if (upsertCategoryMode && mode === "view") {
        setMode("upsert");
      }
    }, [isOpen, mode, upsertCategoryMode]);

    const openCategoryUpdate = useCallback(
      (category: CategoryModel) =>
        useStore.getState().openUpsertCategory(category),
      [],
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
                {upsertCategoryMode === "update" ? "Update" : "Insert"}
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
