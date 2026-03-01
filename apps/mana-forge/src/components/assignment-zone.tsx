import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import { Button, Text, Title } from "@mantine/core";
import { cn } from "cn";
import { type FC, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  type AssignmentId,
  formatCard,
  mergeBinders,
  useSplitStore,
} from "../stores/split.store.ts";
import { downloadTextFile } from "../utils/download-text-file.ts";
import { BinderCard, type Position } from "./binder-card.tsx";

const cardWidth = 180;
const cardHeight = 50;

function isOverlapping(pos1: Position, pos2: Position): boolean {
  return !(
    pos1.x + cardWidth <= pos2.x ||
    pos2.x + cardWidth <= pos1.x ||
    pos1.y + cardHeight <= pos2.y ||
    pos2.y + cardHeight <= pos1.y
  );
}

function findInitialPosition(
  existingPositions: Array<Position>,
  containerRef: React.RefObject<HTMLDivElement | null>,
): Position {
  const container = containerRef.current;
  const containerWidth = container?.clientWidth ?? 400;
  const containerHeight = container?.clientHeight ?? 200;

  const centerX = (containerWidth - cardWidth) / 2;
  const centerY = (containerHeight - cardHeight) / 2;

  const step = 20;
  const maxRadius = Math.max(containerWidth, containerHeight);

  for (let radius = 0; radius < maxRadius; radius += step) {
    const angleStep = radius === 0 ? 1 : Math.PI / 4;
    for (let angle = 0; angle < 2 * Math.PI; angle += angleStep) {
      const candidate: Position = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };

      if (candidate.x < 0 || candidate.y < 0) {
        continue;
      }
      if (candidate.x + cardWidth > containerWidth) {
        continue;
      }
      if (candidate.y + cardHeight > containerHeight) {
        continue;
      }

      const hasOverlap = existingPositions.some((pos) =>
        isOverlapping(candidate, pos),
      );
      if (!hasOverlap) {
        return candidate;
      }
    }
  }

  return { x: centerX, y: centerY };
}

export const AssignmentZone: FC<AssignmentZoneProps> = ({ assignmentId }) => {
  const { setNodeRef, isOver } = useDroppable({ id: assignmentId });
  const containerRef = useRef<HTMLDivElement>(null);

  const binders = useSplitStore(useShallow((s) => s.assignments[assignmentId]));

  const [positions, setPositions] = useState<Record<string, Position>>({});
  const positionsRef = useRef(positions);
  positionsRef.current = positions;

  const [layerOrder, setLayerOrder] = useState<Array<string>>([]);

  const getPosition = (binderId: string): Position => {
    return positions[binderId] ?? { x: 0, y: 0 };
  };

  const getLayerIndex = (binderId: string): number => {
    const index = layerOrder.indexOf(binderId);
    return index === -1 ? 0 : index + 1;
  };

  const setBinderPosition = (binderId: string, position: Position) => {
    setPositions((prev) => ({ ...prev, [binderId]: position }));
  };

  const bringToFront = (binderId: string) => {
    setLayerOrder((prev) => [
      ...prev.filter((id) => id !== binderId),
      binderId,
    ]);
  };

  useEffect(() => {
    const currentPositions = positionsRef.current;

    const newBinderIds = binders
      .map((b) => b.id)
      .filter((id) => !currentPositions[id]);

    if (newBinderIds.length === 0) {
      return;
    }

    const existingPositions = binders
      .map((b) => currentPositions[b.id])
      .filter((pos): pos is Position => pos !== undefined);

    const newPositions: Record<string, Position> = {};
    for (const binderId of newBinderIds) {
      const allExisting = [
        ...existingPositions,
        ...Object.values(newPositions),
      ];
      newPositions[binderId] = findInitialPosition(allExisting, containerRef);
    }

    setPositions((prev) => ({ ...prev, ...newPositions }));
  }, [binders]);

  useDndMonitor({
    onDragStart: ({ active }) => {
      const binderIndex = binders.findIndex((b) => b.id === active.id);
      if (binderIndex !== -1) {
        bringToFront(active.id.toString());
      }
    },
    onDragEnd: ({ active, over, delta }) => {
      if (over?.id !== assignmentId) {
        return;
      }

      const binderId = active.id.toString();
      const binderIndex = binders.findIndex((b) => b.id === binderId);

      if (binderIndex !== -1) {
        const currentPos = getPosition(binderId);
        setBinderPosition(binderId, {
          x: currentPos.x + delta.x,
          y: currentPos.y + delta.y,
        });
      } else {
        const container = containerRef.current;
        if (!container || !active.rect.current.translated) {
          return;
        }

        const containerRect = container.getBoundingClientRect();
        const { left, top } = active.rect.current.translated;
        setBinderPosition(binderId, {
          x: left - containerRect.left,
          y: top - containerRect.top,
        });
        bringToFront(binderId);
      }
    },
  });

  const handleDownload = () => {
    const mergedCards = mergeBinders(binders);
    const content = mergedCards.map((card) => formatCard(card)).join("/n");
    downloadTextFile(listFilenames[assignmentId], content);
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full flex-col gap-2 rounded-md border-2 border-dashed p-3 transition-colors",
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
        <div
          ref={containerRef}
          className="relative h-full overflow-auto"
        >
          {binders.map((binder) => (
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
