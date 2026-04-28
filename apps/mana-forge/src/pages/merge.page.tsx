import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import type { FC } from "react";
import { useShallow } from "zustand/react/shallow";
import { TextDropZone } from "../components/text-drop-zone.tsx";
import { useMergeStore } from "../stores/merge.store.ts";
import { cardKey, formatCard } from "../utils/card.ts";
import { downloadTextFile } from "../utils/download-text-file.ts";

export const MergePage: FC = () => {
  const files = useMergeStore(useShallow((s) => s.files));
  const result = useMergeStore((s) => s.result);

  const handleDownload = () => {
    if (!result) {
      return;
    }
    const content = result.cards.map(formatCard).join("\n");
    downloadTextFile("merged-decklist.txt", content);
  };

  return (
    <Stack gap="md">
      <Title order={2}>Merge Decklists</Title>

      <TextDropZone
        files={files}
        onAddFiles={(newFiles) => useMergeStore.getState().addFiles(newFiles)}
        onRemoveFile={(index) => useMergeStore.getState().removeFile(index)}
        label="Drag decklist TXT files here or click to select"
        description="Archidekt TXT format — upload two or more decklists to merge"
      />

      <Button
        onClick={() => useMergeStore.getState().merge()}
        disabled={files.length < 2}
      >
        Merge
      </Button>

      {result && (
        <Stack gap="xs">
          <Group justify="space-between">
            <Title order={4}>
              Merged Decklist (
              {result.cards.reduce((sum, c) => sum + c.quantity, 0)} cards)
            </Title>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconDownload size="1em" />}
              disabled={result.cards.length === 0}
              onClick={handleDownload}
            >
              Download
            </Button>
          </Group>

          <Stack
            gap={2}
            className="max-h-96 overflow-y-auto rounded border p-2"
          >
            {result.cards.length === 0 ? (
              <Text
                size="sm"
                c="dimmed"
              >
                No cards found
              </Text>
            ) : (
              result.cards.map((card) => (
                <Text
                  key={cardKey(card)}
                  size="sm"
                >
                  {formatCard(card)}
                </Text>
              ))
            )}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
