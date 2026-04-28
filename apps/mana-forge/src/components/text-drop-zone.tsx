import { ActionIcon, Badge, Group, Stack, Text } from "@mantine/core";
import { IconFileText, IconX } from "@tabler/icons-react";
import { cn } from "cn";
import type { FC } from "react";
import { type FileWithPath, useDropzone } from "react-dropzone-esm";
import type { TextFile } from "../utils/card.ts";

export interface TextDropZoneProps {
  files: Array<TextFile>;
  onAddFiles: (files: Array<TextFile>) => void;
  onRemoveFile: (index: number) => void;
  multiple?: boolean;
  accept?: Record<string, Array<string>>;
  label?: string;
  description?: string;
}

export const TextDropZone: FC<TextDropZoneProps> = ({
  files,
  onAddFiles,
  onRemoveFile,
  multiple = true,
  accept = { "text/plain": [".txt"], "text/csv": [".csv"] },
  label = "Drag TXT or CSV files here or click to select",
  description = "Archidekt TXT format or ManaBox CSV selection export",
}) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (dropped: Array<FileWithPath>) => {
      const newFiles = await Promise.all(
        dropped.map(async (file) => ({
          name: file.name,
          content: await file.text(),
        })),
      );
      onAddFiles(newFiles);
    },
    multiple,
    useFsAccessApi: false,
    accept,
  });

  return (
    <Stack gap="sm">
      <button
        {...getRootProps({
          className: cn(
            "flex min-h-32 w-full items-center justify-center rounded-sm border-2 border-dashed hover:bg-gray-100 dark:hover:bg-gray-800",
          ),
          "aria-label": "click or drag & drop to upload collection text files",
        })}
      >
        <input {...getInputProps()} />
        <div
          className={cn(
            "grid grid-flow-row auto-rows-auto gap-x-4 p-2 lg:auto-cols-auto lg:grid-flow-col",
          )}
        >
          <IconFileText
            className={cn("justify-self-center text-gray-400 lg:row-span-2")}
            size="4em"
          />
          <Text
            size="xl"
            className={cn("text-balance")}
          >
            {label}
          </Text>
          <Text
            size="sm"
            c="dimmed"
          >
            {description}
          </Text>
        </div>
      </button>

      {files.map((file, index) => (
        <Group
          key={`${file.name}-${index}`}
          justify="space-between"
          p="xs"
          className={cn("rounded border")}
        >
          <Group gap="xs">
            <IconFileText size="1.2em" />
            <Text size="sm">{file.name}</Text>
            <Badge
              size="sm"
              variant="light"
            >
              {file.content.split("\n").filter((l) => l.trim()).length} lines
            </Badge>
          </Group>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => onRemoveFile(index)}
            aria-label={`Remove ${file.name}`}
          >
            <IconX size="1em" />
          </ActionIcon>
        </Group>
      ))}
    </Stack>
  );
};
