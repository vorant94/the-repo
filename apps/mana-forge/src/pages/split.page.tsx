import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Stack, Title } from "@mantine/core";
import { cn } from "cn";
import { type FC, useState } from "react";
import { AssignmentZone } from "../components/assignment-zone.tsx";
import { BinderCard } from "../components/binder-card.tsx";
import { CsvDropZone } from "../components/csv-drop-zone.tsx";
import {
  type AssignmentId,
  assignmentId,
  type Binder,
  isAssignmentId,
  useSplitStore,
} from "../stores/split.store.ts";

export const SplitPage: FC = () => {
  const [activeBinder, setActiveBinder] = useState<Binder | null>(null);
  const [fromAssignment, setFromAssignment] = useState<AssignmentId | null>(
    null,
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    const [activeBinder, fromAssignment] = findBinderById(active.id.toString());

    setActiveBinder(activeBinder);
    setFromAssignment(fromAssignment);
  };

  const handleDragEnd = ({ over }: DragEndEvent) => {
    if (!activeBinder || !fromAssignment) {
      console.debug(
        "tried to drag end binder, but either activeBinder or fromAssignment is missing",
      );
      return;
    }

    if (
      !over ||
      !isAssignmentId(over.id.toString()) ||
      over.id === fromAssignment
    ) {
      setActiveBinder(null);
      setFromAssignment(null);
      return;
    }

    useSplitStore
      .getState()
      .moveBinder(activeBinder.id, fromAssignment, over.id as AssignmentId);

    setActiveBinder(null);
    setFromAssignment(null);
  };

  return (
    <div
      className={cn("flex flex-col gap-4 overflow-hidden")}
      style={{
        height:
          "calc(100dvh - var(--app-shell-header-height) - 2 * var(--mantine-spacing-md))",
      }}
    >
      <Title order={2}>Split Collection</Title>

      <CsvDropZone />

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={cn("flex min-h-0 flex-1 gap-4")}>
          <div className={cn("flex-1 overflow-y-auto")}>
            <Stack>
              <AssignmentZone assignmentId={assignmentId.collection} />
            </Stack>
          </div>
          <div className={cn("flex-1 overflow-y-auto")}>
            <Stack>
              <AssignmentZone assignmentId={assignmentId.tradeOrBuy} />
              <AssignmentZone assignmentId={assignmentId.tradeOnly} />
              <AssignmentZone assignmentId={assignmentId.bulk} />
            </Stack>
          </div>
        </div>

        <DragOverlay>
          {activeBinder ? <BinderCard binder={activeBinder} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

function findBinderById(
  binderId: string,
): [Binder, AssignmentId] | [null, null] {
  const { assignments } = useSplitStore.getState();

  for (const assignment of Object.values(assignmentId)) {
    const binder = assignments[assignment].find((b) => b.id === binderId);
    if (!binder) {
      continue;
    }

    return [binder, assignment];
  }

  return [null, null];
}
