export const reportRenderSize = {
  width: 1920,
  height: 1080,
} as const;

export const largeEventPlayerThreshold = 64;
export const largeEventReportHeight = reportRenderSize.height * 1.5;

export function getEventReportRenderSize(playerCount: number) {
  if (playerCount < largeEventPlayerThreshold) {
    return reportRenderSize;
  }

  return { ...reportRenderSize, height: largeEventReportHeight };
}
