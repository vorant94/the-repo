import { Button, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { cn } from "cn";
import { type FC, useState } from "react";
import { TextDropZone, type TextFile } from "../components/text-drop-zone.tsx";
import type { Card } from "../stores/split.store.ts";
import { formatCard } from "../stores/split.store.ts";
import { type CompareResult, compareCards } from "../utils/compare-cards.ts";
import { downloadTextFile } from "../utils/download-text-file.ts";
import { parseCollectionFile } from "../utils/parse-collection-card.ts";

export const ComparePage: FC = () => {
  const [files, setFiles] = useState<Array<TextFile>>([]);
  const [result, setResult] = useState<CompareResult | null>(null);

  const handleCompare = () => {
    const lists = files.map((f) => parseCollectionFile(f.content));
    setResult(compareCards(lists));
  };

  const handleDownload = (cards: Array<Card>, filename: string) => {
    const content = cards.map(formatCard).join("\n");
    downloadTextFile(filename, content);
  };

  return (
    <Stack gap="md">
      <Title order={2}>Compare Collections</Title>

      <TextDropZone
        files={files}
        onFilesChange={setFiles}
      />

      <Button
        onClick={handleCompare}
        disabled={files.length < 2}
      >
        Compare
      </Button>

      {result && (
        <SimpleGrid cols={2}>
          <ResultSection
            title="Exact Matches"
            cards={result.exactMatches}
            downloadFilename="exact-matches.txt"
            onDownload={handleDownload}
          />
          <ResultSection
            title="Partial Matches"
            cards={result.partialMatches}
            downloadFilename="partial-matches.txt"
            onDownload={handleDownload}
          />
        </SimpleGrid>
      )}
    </Stack>
  );
};

interface ResultSectionProps {
  title: string;
  cards: Array<Card>;
  downloadFilename: string;
  onDownload: (cards: Array<Card>, filename: string) => void;
}

const ResultSection: FC<ResultSectionProps> = ({
  title,
  cards,
  downloadFilename,
  onDownload,
}) => {
  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Title order={4}>
          {title} ({cards.length})
        </Title>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconDownload size="1em" />}
          disabled={cards.length === 0}
          onClick={() => onDownload(cards, downloadFilename)}
        >
          Download
        </Button>
      </Group>

      <Stack
        gap={2}
        className={cn("max-h-96 overflow-y-auto rounded border p-2")}
      >
        {cards.length === 0 ? (
          <Text
            size="sm"
            c="dimmed"
          >
            No matches found
          </Text>
        ) : (
          cards.map((card, index) => (
            <Text
              key={`${card.name}|${card.setCode}|${card.collectorNumber}|${card.foil}-${index}`}
              size="sm"
            >
              {formatCard(card)}
            </Text>
          ))
        )}
      </Stack>
    </Stack>
  );
};
