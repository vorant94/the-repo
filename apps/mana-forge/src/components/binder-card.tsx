import { useDraggable } from "@dnd-kit/core";
import type { MantineColor, MantineStyleProp } from "@mantine/core";
import { Badge, Card, Group, Text } from "@mantine/core";
import { cn } from "cn";
import type { FC } from "react";
import type { Binder, BinderType } from "../stores/split.store.ts";

export const BinderCard: FC<BinderCardProps> = ({
  binder,
  position,
  zIndex,
  onBringToFront,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: binder.id });

  const color = binderTypeColor[binder.binderType];

  const style: MantineStyleProp = {
    borderLeft: `4px solid var(--mantine-color-${color}-filled)`,
    position: "absolute",
    left: position.x,
    top: position.y,
    zIndex,
    ...(transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : null),
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onClick={onBringToFront}
      {...listeners}
      {...attributes}
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder
      className={cn("cursor-grab select-none", isDragging && "opacity-50")}
    >
      <Group justify="space-between">
        <Text
          fw={500}
          size="sm"
        >
          {binder.name}
        </Text>
        <Badge
          size="sm"
          color={color}
          variant="light"
        >
          {binder.cardCount}
        </Badge>
      </Group>
    </Card>
  );
};

export interface BinderCardProps {
  binder: Binder;
  position: Position;
  zIndex: number;
  onBringToFront: () => void;
}

export interface Position {
  x: number;
  y: number;
}

export const binderTypeColor: Record<BinderType, MantineColor> = {
  binder: "blue",
  deck: "violet",
  list: "teal",
};
