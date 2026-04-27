import { Text } from "@mantine/core";
import { IconFileSpreadsheet } from "@tabler/icons-react";
import { cn } from "cn";
import type { FC } from "react";
import { type FileWithPath, useDropzone } from "react-dropzone-esm";
import { useSplitStore } from "../stores/split.store.ts";

export const CsvDropZone: FC = () => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async ([file]: Array<FileWithPath>) => {
      if (!file) {
        return;
      }

      const content = await file.text();
      useSplitStore.getState().parseCollection(content);
    },
    multiple: false,
    useFsAccessApi: false,
    accept: { "text/csv": [".csv"] },
  });

  return (
    <button
      {...getRootProps({
        className: cn(
          "flex min-h-48 w-full items-center justify-center rounded-sm border-2 border-dashed hover:bg-gray-100 dark:hover:bg-gray-800",
        ),
        "aria-label": "click or drag & drop to upload ManaBox CSV",
      })}
    >
      <input {...getInputProps()} />
      <div
        className={cn(
          "grid grid-flow-row auto-rows-auto gap-x-4 p-2 lg:auto-cols-auto lg:grid-flow-col",
        )}
      >
        <IconFileSpreadsheet
          className={cn("justify-self-center text-gray-400 lg:row-span-2")}
          size="4em"
        />
        <Text
          size="xl"
          className={cn("text-balance")}
        >
          Drag ManaBox CSV here or click to select it
        </Text>
        <Text
          size="sm"
          c="dimmed"
        >
          Attach one file of CSV format
        </Text>
      </div>
    </button>
  );
};
