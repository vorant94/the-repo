import { Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconFileCode } from "@tabler/icons-react";
import { cn } from "cn";
import { ntJsonParse, ntParseWithZod } from "nt";
import { type FC, useEffect, useState } from "react";
import { type FileWithPath, useDropzone } from "react-dropzone-esm";
import {
  type RecoveryModel,
  recoverySchema,
} from "../../../shared/api/recovery.model.ts";
import { Icon } from "../../../shared/ui/icon.tsx";
import { notificationColor } from "../../../shared/ui/notification.ts";

export const ImportRecoveryDropZone: FC<ImportRecoveryDropZoneProps> = ({
  onRecoveryParsed,
}) => {
  const [reader] = useState(() => new FileReader());

  const readFile = ([file]: Array<FileWithPath>) =>
    file && reader.readAsText(file);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: readFile,
    multiple: false,
    // Playwright won't work without useFsAccessApi see https://github.com/microsoft/playwright/issues/8850
    useFsAccessApi: false,
    accept: { "application/json": [".json"] },
  });

  useEffect(() => {
    const controller = new AbortController();

    reader.addEventListener(
      "load",
      ({ currentTarget }: ProgressEvent<FileReader>) => {
        if (!currentTarget) {
          throw new Error("currentTarget is missing");
        }

        const { result } = currentTarget as FileReader;
        if (typeof result !== "string") {
          throw new Error("type of result should be string");
        }

        const parsedResult = ntJsonParse(result).andThen((result) =>
          ntParseWithZod(result, recoverySchema),
        );
        if (parsedResult.isErr()) {
          notifications.show({
            color: notificationColor.error,
            title: "Recovery is malformed",
            message: "Failed to parse recovery file, cannot proceed",
          });
          return;
        }

        onRecoveryParsed(parsedResult.value);
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  });

  return (
    <button
      {...getRootProps({
        className: cn(
          "flex min-h-48 items-center justify-center rounded-sm border-2 border-dashed hover:bg-gray-100",
        ),
        "aria-label": "click or drag & drop to upload file",
      })}
    >
      <input {...getInputProps()} />
      <div
        className={cn(
          "grid grid-flow-row auto-rows-auto gap-x-4 p-2 lg:auto-cols-auto lg:grid-flow-col",
        )}
      >
        <Icon
          icon={IconFileCode}
          className={cn("justify-self-center text-gray-400 lg:row-span-2")}
          size="4em"
        />
        <Text
          size="xl"
          className={cn("text-balance")}
        >
          Drag file here or click to select it
        </Text>
        <Text
          size="sm"
          c="dimmed"
        >
          Attach one file of JSON format
        </Text>
      </div>
    </button>
  );
};

export interface ImportRecoveryDropZoneProps {
  onRecoveryParsed(recovery: RecoveryModel): void;
}
