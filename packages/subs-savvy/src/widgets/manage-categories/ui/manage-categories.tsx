import { Icon } from "@/shared/ui/icon.tsx";
import { ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { memo } from "react";
import { ManageCategoriesModal } from "./manage-categories-modal.tsx";

export const ManageCategories = memo(() => {
  const [isManageCategoriesOpen, manageCategories] = useDisclosure(false);

  return (
    <>
      <ActionIcon
        aria-label="Manage Categories"
        onClick={manageCategories.open}
        size="lg"
        variant="light"
      >
        <Icon icon={IconAdjustmentsHorizontal} />
      </ActionIcon>

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        close={manageCategories.close}
      />
    </>
  );
});
