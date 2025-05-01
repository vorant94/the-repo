import {
  CloseButton,
  Combobox,
  Input,
  InputBase,
  useCombobox,
} from "@mantine/core";
import { IconCircleFilled } from "@tabler/icons-react";
import { cn } from "cn";
import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  useCategories,
  useSelectedCategory,
  useStore,
} from "../../../shared/store/hooks.ts";
import { Icon } from "../../../shared/ui/icon.tsx";

export const SelectCategory = memo(() => {
  const categories = useCategories();

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const selectedCategory = useSelectedCategory();
  const handleSelectCategory = useCallback(
    (categoryId: string | null) => {
      const { selectCategory, deselectCategory } = useStore.getState();
      categoryId ? selectCategory(categoryId) : deselectCategory();
      combobox.closeDropdown();
    },
    [combobox],
  );

  const { t } = useTranslation();

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={handleSelectCategory}
    >
      <Combobox.Target>
        <InputBase
          aria-label={t("select-category")}
          className={cn("w-48")}
          component="button"
          type="button"
          pointer
          leftSection={
            selectedCategory ? (
              <Icon
                icon={IconCircleFilled}
                color={selectedCategory.color}
              />
            ) : null
          }
          rightSection={
            selectedCategory ? (
              <CloseButton
                size="sm"
                onMouseDown={(event) => event.preventDefault()}
                onClick={useStore.getState().deselectCategory}
                aria-label="Clear selected category"
              />
            ) : (
              <Combobox.Chevron />
            )
          }
          rightSectionPointerEvents={selectedCategory ? "all" : "none"}
          onClick={() => combobox.toggleDropdown()}
        >
          {selectedCategory?.name ?? (
            <Input.Placeholder>{t("select-category")}</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {categories.map((category) => (
            <Combobox.Option
              value={`${category.id}`}
              key={category.id}
            >
              <Icon
                icon={IconCircleFilled}
                color={category.color}
              />{" "}
              {category.name}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
});
