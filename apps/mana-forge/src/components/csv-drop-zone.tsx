import { Text } from "@mantine/core";
import { IconFileSpreadsheet } from "@tabler/icons-react";
import { cn } from "cn";
import { type FC, useEffect, useState } from "react";
import { type FileWithPath, useDropzone } from "react-dropzone-esm";
import { useSplitStore } from "../stores/split.store.ts";

export const CsvDropZone: FC = () => {
  const [reader] = useState(() => new FileReader());

  useEffect(() => {
    const controller = new AbortController();

    reader.addEventListener(
      "load",
      ({ target }: ProgressEvent<FileReader>) => {
        if (!target) {
          throw new Error("currentTarget is missing");
        }

        if (typeof target.result !== "string") {
          throw new Error("type of result should be string");
        }

        useSplitStore.getState().parseCollection(target.result);
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: ([file]: Array<FileWithPath>) => {
      if (!file) {
        return;
      }

      reader.readAsText(file);
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
