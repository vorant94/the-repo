import { Button, SimpleGrid, Stack, Title } from "@mantine/core";
import type { FC } from "react";
import { useShallow } from "zustand/react/shallow";
import { ResultSection } from "../components/result-section.tsx";
import { TextDropZone } from "../components/text-drop-zone.tsx";
import { resultSectionId, useCompareStore } from "../stores/compare.store.ts";

export const ComparePage: FC = () => {
  const files = useCompareStore(useShallow((s) => s.files));
  const result = useCompareStore((s) => s.result);

  return (
    <Stack gap="md">
      <Title order={2}>Compare Collections</Title>

      <TextDropZone
        files={files}
        onAddFiles={(newFiles) => useCompareStore.getState().addFiles(newFiles)}
        onRemoveFile={(index) => useCompareStore.getState().removeFile(index)}
      />

      <Button
        onClick={() => useCompareStore.getState().compare()}
        disabled={files.length < 2}
      >
        Compare
      </Button>

      {result && (
        <SimpleGrid cols={2}>
          <ResultSection resultSectionId={resultSectionId.exactMatches} />
          <ResultSection resultSectionId={resultSectionId.partialMatches} />
        </SimpleGrid>
      )}
    </Stack>
  );
};
