import { useDndMonitor } from "@dnd-kit/core";
import { type RefObject, useEffect, useRef, useState } from "react";
import type { AssignmentId, Binder } from "../stores/split.store.ts";

export interface Position {
  x: number;
  y: number;
}

export interface UseBinderPositionsProps {
  binders: Array<Binder>;
  containerRef: RefObject<HTMLDivElement | null>;
  assignmentId: AssignmentId;
}

export interface UseBinderPositions {
  getPosition: (binderId: string) => Position;
  getLayerIndex: (binderId: string) => number;
  bringToFront: (binderId: string) => void;
}

export function useBinderPositions({
  binders,
  containerRef,
  assignmentId,
}: UseBinderPositionsProps): UseBinderPositions {
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
  }, [binders, containerRef]);

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

      if (binderIndex === -1) {
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
      } else {
        const currentPos = getPosition(binderId);
        setBinderPosition(binderId, {
          x: currentPos.x + delta.x,
          y: currentPos.y + delta.y,
        });
      }
    },
  });

  return { getPosition, getLayerIndex, bringToFront };
}

const cardWidth = 180;
const cardHeight = 50;
const gap = 24;
const maxAttempts = 400;

function isOverlapping(
  pos1: Position,
  pos2: Position,
  padding: number,
): boolean {
  return !(
    pos1.x + cardWidth + padding <= pos2.x ||
    pos2.x + cardWidth + padding <= pos1.x ||
    pos1.y + cardHeight + padding <= pos2.y ||
    pos2.y + cardHeight + padding <= pos1.y
  );
}

// Rejection sampling ("dart throwing"): try random spots inside the visible
// canvas, keep the first that doesn't collide with an existing binder. Produces
// an organic, force-directed-graph-like scatter instead of rigid rows. Positions
// stay within the container bounds (no scroll); if no free spot is found after
// maxAttempts, a random overlapping spot is used as a fallback.
function findInitialPosition(
  existingPositions: Array<Position>,
  containerRef: RefObject<HTMLDivElement | null>,
): Position {
  const container = containerRef.current;
  const containerWidth = container?.clientWidth ?? 400;
  const containerHeight = container?.clientHeight ?? 200;

  const maxX = Math.max(0, containerWidth - cardWidth);
  const maxY = Math.max(0, containerHeight - cardHeight);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate: Position = {
      x: Math.random() * maxX,
      y: Math.random() * maxY,
    };
    if (!existingPositions.some((pos) => isOverlapping(candidate, pos, gap))) {
      return candidate;
    }
  }

  return { x: Math.random() * maxX, y: Math.random() * maxY };
}
