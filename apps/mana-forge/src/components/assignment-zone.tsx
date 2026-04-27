import { useDroppable } from "@dnd-kit/core";
import { Button, Chip, Group, Text, Title } from "@mantine/core";
import { cn } from "cn";
import { type FC, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useBinderPositions } from "../hooks/use-binder-positions.ts";
import {
  type AssignmentId,
  type BinderType,
  binderType,
  mergeBinders,
  useSplitStore,
} from "../stores/split.store.ts";
import { formatCard } from "../utils/card.ts";
import { downloadTextFile } from "../utils/download-text-file.ts";
import { BinderCard, binderTypeColor } from "./binder-card.tsx";

export interface AssignmentZoneProps {
  assignmentId: AssignmentId;
  showTypeFilter?: boolean;
  showDownload?: boolean;
}

export const AssignmentZone: FC<AssignmentZoneProps> = ({
  assignmentId,
  showTypeFilter,
  showDownload,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: assignmentId });
  const containerRef = useRef<HTMLDivElement>(null);

  const binders = useSplitStore(useShallow((s) => s.assignments[assignmentId]));

  const [visibleBinderTypes, setVisibleBinderTypes] = useState<Set<BinderType>>(
    new Set(Object.values(binderType)),
  );
  const filteredBinders = binders.filter((b) =>
    visibleBinderTypes.has(b.binderType),
  );

  const { getPosition, getLayerIndex, bringToFront } = useBinderPositions({
    binders,
    containerRef,
    assignmentId,
  });

  const handleDownload = () => {
    const mergedCards = mergeBinders(binders);
    const content = mergedCards.map((card) => formatCard(card)).join("\n");
    downloadTextFile(listFilenames[assignmentId], content);
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full flex-col gap-2 overflow-y-visible rounded-md border-2 border-dashed p-3 transition-colors sm:overflow-y-auto",
        isOver
          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-300 dark:border-gray-600",
      )}
    >
      <div className={cn("flex items-center justify-between")}>
        <Title order={4}>{listLabels[assignmentId]}</Title>
        {showTypeFilter && (
          <Chip.Group
            multiple
            value={Array.from(visibleBinderTypes)}
            onChange={(values) =>
              setVisibleBinderTypes(new Set(values as Array<BinderType>))
            }
          >
            <Group gap="xs">
              {Object.values(binderType).map((type) => (
                <Chip
                  key={type}
                  value={type}
                  color={binderTypeColor[type]}
                  size="xs"
                >
                  {type}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        )}
        {showDownload && (
          <Button
            size="xs"
            variant="light"
            disabled={binders.length === 0}
            onClick={handleDownload}
          >
            Download
          </Button>
        )}
      </div>
      {binders.length === 0 ? (
        <Text
          c="dimmed"
          size="sm"
        >
          Drop binders here
        </Text>
      ) : (
        <div
          ref={containerRef}
          className="relative h-full overflow-auto"
        >
          {filteredBinders.map((binder) => (
            <BinderCard
              key={binder.id}
              binder={binder}
              position={getPosition(binder.id)}
              zIndex={getLayerIndex(binder.id)}
              onBringToFront={() => bringToFront(binder.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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
