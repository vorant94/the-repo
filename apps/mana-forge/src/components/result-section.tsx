import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { cn } from "cn";
import type { FC } from "react";
import {
  type ResultSectionId,
  useCompareStore,
} from "../stores/compare.store.ts";
import { formatCard } from "../utils/card.ts";
import { downloadTextFile } from "../utils/download-text-file.ts";

export interface ResultSectionProps {
  resultSectionId: ResultSectionId;
}

export const ResultSection: FC<ResultSectionProps> = ({ resultSectionId }) => {
  const cards = useCompareStore((s) => s.result?.[resultSectionId] ?? []);

  const handleDownload = () => {
    const content = cards.map(formatCard).join("\n");
    downloadTextFile(resultSectionFilenames[resultSectionId], content);
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Title order={4}>
          {resultSectionTitles[resultSectionId]} (
          {cards.reduce((sum, c) => sum + c.quantity, 0)})
        </Title>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconDownload size="1em" />}
          disabled={cards.length === 0}
          onClick={handleDownload}
        >
          Download
        </Button>
      </Group>

      <Stack
        gap={2}
        className={cn("max-h-48 flex-1 overflow-y-auto rounded border p-2")}
      >
        {cards.length === 0 ? (
          <Text
            size="sm"
            c="dimmed"
          >
            No matches found
          </Text>
        ) : (
          <Text
            size="sm"
            className={cn("whitespace-pre-wrap")}
          >
            {cards.map(formatCard).join("\n")}
          </Text>
        )}
      </Stack>
    </Stack>
  );
};

const resultSectionTitles: Record<ResultSectionId, string> = {
  exactMatches: "Exact Matches",
  partialMatches: "Version / Foil Mismatches",
  onlyInFirst: "Only in First Deck",
  onlyInSecond: "Only in Second Deck",
};

const resultSectionFilenames: Record<ResultSectionId, string> = {
  exactMatches: "exact-matches.txt",
  partialMatches: "version-foil-mismatches.txt",
  onlyInFirst: "only-in-first-deck.txt",
  onlyInSecond: "only-in-second-deck.txt",
};
