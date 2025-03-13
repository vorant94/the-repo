export type TailwindBackgroundColor = `bg-${TailwindColor}-${string}`;

export const tailwindColors = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;
export type TailwindColor = (typeof tailwindColors)[number];

export type TailWindThemedStyle<T extends string> = readonly [T, `dark:${T}`];
