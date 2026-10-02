export const minimumPlayersForMultiPageReport = 64;
export const maximumPlayersPerStandingsPage = 76;

export type EventReportPage =
  | { kind: "combined" }
  | { kind: "chart" }
  | { kind: "standings"; standingsPage: number };

export function getEventReportPages(
  playerCount: number,
): Array<EventReportPage> {
  if (playerCount < minimumPlayersForMultiPageReport) {
    return [{ kind: "combined" }];
  }

  const standingsPageCount = Math.ceil(
    playerCount / maximumPlayersPerStandingsPage,
  );
  return [
    { kind: "chart" },
    ...Array.from({ length: standingsPageCount }, (_, standingsPage) => ({
      kind: "standings" as const,
      standingsPage,
    })),
  ];
}
