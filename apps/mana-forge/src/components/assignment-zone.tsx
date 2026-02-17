import { useDroppable } from "@dnd-kit/core";
import { Button, Stack, Text, Title } from "@mantine/core";
import { cn } from "cn";
import type { FC } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  type AssignmentId,
  formatCard,
  mergeBinders,
  useSplitStore,
} from "../stores/split.store.ts";
import { downloadTextFile } from "../utils/download-text-file.ts";
import { BinderCard } from "./binder-card.tsx";

export const AssignmentZone: FC<AssignmentZoneProps> = ({ assignmentId }) => {
  const { setNodeRef, isOver } = useDroppable({ id: assignmentId });

  const binders = useSplitStore(useShallow((s) => s.assignments[assignmentId]));

  const handleDownload = () => {
    const mergedCards = mergeBinders(binders);
    const content = mergedCards.map((card) => formatCard(card)).join("/n");
    downloadTextFile(listFilenames[assignmentId], content);
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-32 flex-col gap-2 rounded-md border-2 border-dashed p-3 transition-colors",
        isOver
          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-300 dark:border-gray-600",
      )}
    >
      <div className={cn("flex items-center justify-between")}>
        <Title order={4}>{listLabels[assignmentId]}</Title>
        <Button
          size="xs"
          variant="light"
          disabled={binders.length === 0}
          onClick={handleDownload}
        >
          Download
        </Button>
      </div>
      {binders.length === 0 ? (
        <Text
          c="dimmed"
          size="sm"
        >
          Drop binders here
        </Text>
      ) : (
        <Stack gap="xs">
          {binders.map((binder) => (
            <BinderCard
              key={binder.id}
              binder={binder}
            />
          ))}
        </Stack>
      )}
    </div>
  );
};

export interface AssignmentZoneProps {
  assignmentId: AssignmentId;
}

const listLabels: Record<AssignmentId, string> = {
  tradeOrBuy: "Trade or Buy",
  tradeOnly: "Only Trade",
  bulk: "Bulk",
  collection: "Collection",
};

const listFilenames: Record<AssignmentId, string> = {
  tradeOrBuy: "trade-or-buy.txt",
  tradeOnly: "trade-only.txt",
  bulk: "bulk.txt",
  collection: "collection.txt",
};
