import type { ReactElement } from "react";
import type { PieSectorShapeProps } from "recharts";
import { Sector } from "recharts";

const colors = [
  "#2563eb",
  "#dc2626",
  "#f59e0b",
  "#16a34a",
  "#7c3aed",
  "#0891b2",
  "#ea580c",
  "#db2777",
  "#65a30d",
  "#4f46e5",
  "#0f766e",
  "#a16207",
  "#9333ea",
  "#be123c",
  "#15803d",
  "#475569",
];

export const PieSlice = ({
  index,
  ...props
}: PieSectorShapeProps): ReactElement => (
  <Sector
    {...props}
    fill={colors[index % colors.length] ?? "#475569"}
  />
);
