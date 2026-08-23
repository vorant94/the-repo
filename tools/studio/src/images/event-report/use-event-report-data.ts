import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";
import { eventReportDataSchema } from "./schema.ts";

export const useEventReportData = () => {
  const [handle] = useState(() => delayRender("Loading meta report data"));
  const { data } = useQuery({
    queryKey: ["event-report-data"],
    queryFn: async () => {
      try {
        const [archetypes, events, hosts, players] = await Promise.all(
          ["archetypes", "events", "hosts", "players"].map(async (fileName) => {
            const response = await fetch(
              staticFile(`data/event-report/${fileName}.json`),
            );

            if (!response.ok) {
              throw new Error(
                `Could not load meta report data: ${fileName}.json`,
              );
            }

            return response.json();
          }),
        );
        const eventReportData = eventReportDataSchema.parse({
          archetypes,
          events,
          hosts,
          players,
        });

        continueRender(handle);
        return eventReportData;
      } catch (error: unknown) {
        cancelRender(error);
        throw error;
      }
    },
  });

  return data;
};
