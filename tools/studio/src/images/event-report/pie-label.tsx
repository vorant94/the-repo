import type { FC } from "react";

export interface PieLabelProps {
  connectorX: number;
  connectorY: number;
  elbowX: number;
  isDark: boolean;
  name: string;
  percent: string;
  textAnchor: "end" | "start";
  textX: number;
  y: number;
}

export const PieLabel: FC<PieLabelProps> = ({
  connectorX,
  connectorY,
  elbowX,
  isDark,
  name,
  percent,
  textAnchor,
  textX,
  y,
}) => {
  const primaryColor = isDark ? "#f8fafc" : "#0f172a";
  const secondaryColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <g>
      <path
        d={`M ${connectorX} ${connectorY} L ${elbowX} ${y} L ${textX} ${y}`}
        fill="none"
        stroke={secondaryColor}
        strokeWidth={2}
      />
      <circle
        cx={connectorX}
        cy={connectorY}
        r={4}
        fill={isDark ? "#cbd5e1" : "#475569"}
      />
      <text
        x={textX}
        y={y - 6}
        textAnchor={textAnchor}
        fill={primaryColor}
        fontSize={18}
        fontWeight={700}
      >
        {name}
      </text>
      <text
        x={textX}
        y={y + 17}
        textAnchor={textAnchor}
        fill={secondaryColor}
        fontSize={15}
        fontWeight={600}
      >
        {percent}
      </text>
    </g>
  );
};
