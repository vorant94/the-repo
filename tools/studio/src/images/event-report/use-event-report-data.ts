import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";
import { eventReportDataSchema } from "./schema.ts";

const eventReportDataBaseUrl = "https://pauper-il.vorant94.dev/reports-data";

export const useEventReportData = () => {
  const [handle] = useState(() => delayRender("Loading meta report data"));
  const { data } = useQuery({
    queryKey: ["event-report-data"],
    queryFn: async () => {
      try {
        const [archetypes, events, hosts, players] = await Promise.all(
          ["archetypes", "events", "hosts", "players"].map(async (fileName) => {
            const response = await fetch(
              `${eventReportDataBaseUrl}/${fileName}.json`,
            );

            if (!response.ok) {
              throw new Error(
                `Could not load remote meta report data: ${fileName}.json`,
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
