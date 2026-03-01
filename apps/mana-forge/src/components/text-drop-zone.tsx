import { ActionIcon, Badge, Group, Stack, Text } from "@mantine/core";
import { IconFileText, IconX } from "@tabler/icons-react";
import { cn } from "cn";
import type { FC } from "react";
import { type FileWithPath, useDropzone } from "react-dropzone-esm";

export interface TextFile {
  name: string;
  content: string;
}

interface TextDropZoneProps {
  files: Array<TextFile>;
  onFilesChange: (files: Array<TextFile>) => void;
}

export const TextDropZone: FC<TextDropZoneProps> = ({
  files,
  onFilesChange,
}) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (dropped: Array<FileWithPath>) => {
      const newFiles = await Promise.all(
        dropped.map(async (file) => ({
          name: file.name,
          content: await file.text(),
        })),
      );
      onFilesChange([...files, ...newFiles]);
    },
    multiple: true,
    useFsAccessApi: false,
    accept: { "text/plain": [".txt"] },
  });

  const handleRemove = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

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
            Drag collection TXT files here or click to select
          </Text>
          <Text
            size="sm"
            c="dimmed"
          >
            Attach multiple files in Archidekt format
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
            onClick={() => handleRemove(index)}
            aria-label={`Remove ${file.name}`}
          >
            <IconX size="1em" />
          </ActionIcon>
        </Group>
      ))}
    </Stack>
  );
};
