import "./style.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { FC } from "react";
import { Still } from "remotion";
import { DigitalGarden } from "./images/digital-garden/digital-garden";
import {
  EventReport,
  eventReportPropsSchema,
} from "./images/event-report/event-report";
import { ThoughtsOnModernFrameworkFeatures } from "./images/thoughts-on-modern-framework-features/thoughts-on-modern-framework.features";
import {
  TypescriptMonoreposAreAMess,
  typescriptMonoreposAreAMessPropsSchema,
} from "./images/typescript-monorepos-are-a-mess/typescript-monorepos-are-a-mess";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: Number.POSITIVE_INFINITY,
    },
  },
});

export const RemotionRoot: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Still
        id="typescript-monorepos-are-a-mess"
        component={TypescriptMonoreposAreAMess}
        schema={typescriptMonoreposAreAMessPropsSchema}
        defaultProps={{ mode: "dark" }}
        width={1064}
        height={808}
      />

      <Still
        id="thoughts-on-modern-framework-features"
        component={ThoughtsOnModernFrameworkFeatures}
        width={544}
        height={500}
      />

      <Still
        id="digital-garden"
        component={DigitalGarden}
        width={1792}
        height={920}
      />

      <Still
        id="event-report"
        component={EventReport}
        schema={eventReportPropsSchema}
        defaultProps={{ eventId: "weekly-pauper-2026-08-20", mode: "light" }}
        width={1920}
        height={1080}
      />
    </QueryClientProvider>
  );
};
