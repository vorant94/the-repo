import { ActionIcon, Text } from "@mantine/core";
import { IconCircleFilled, IconPencil, IconTrash } from "@tabler/icons-react";
import { type FC, memo } from "react";
import type { CategoryModel } from "../../../shared/api/category.model.ts";
import { cn } from "../../../shared/ui/cn.ts";
import { Icon } from "../../../shared/ui/icon.tsx";

export const CategoryList: FC<CategoryListPros> = memo(
  ({ categories, onEditClick, onDeleteClick }) => {
    return (
      <div className={cn("flex flex-col divide-y divide-dashed")}>
        {categories.length > 0 ? (
          categories.map((category) => (
            <div
              className={cn("flex items-center gap-2 py-1")}
              key={category.id}
            >
              <Icon
                icon={IconCircleFilled}
                color={category.color}
              />

              <Text>{category.name}</Text>

              <div className={cn("flex-1")} />

              <ActionIcon
                aria-label={`edit ${category.name} category`}
                variant="subtle"
                onClick={() => onEditClick(category)}
              >
                <Icon icon={IconPencil} />
              </ActionIcon>

              <ActionIcon
                aria-label={`delete ${category.name} category`}
                variant="subtle"
                color="red"
                onClick={() => onDeleteClick(category)}
              >
                <Icon icon={IconTrash} />
              </ActionIcon>
            </div>
          ))
        ) : (
          <div>No Categories</div>
        )}
      </div>
    );
  },
);

export interface CategoryListPros {
  categories: ReadonlyArray<CategoryModel>;
  onEditClick: (category: CategoryModel) => void;
  onDeleteClick: (category: CategoryModel) => void;
}
