export function extractVideoId(url: string): string {
  const parsed = new URL(url);

  if (parsed.hostname === "youtu.be") {
    const videoId = parsed.pathname.slice(1);
    if (!videoId) {
      throw new Error(`Invalid YouTube URL: ${url}`);
    }
    return videoId;
  }

  if (
    parsed.hostname === "www.youtube.com" ||
    parsed.hostname === "youtube.com"
  ) {
    const videoId = parsed.searchParams.get("v");
    if (!videoId) {
      throw new Error(`Invalid YouTube URL: ${url}`);
    }
    return videoId;
  }

  throw new Error(`Invalid YouTube URL: ${url}`);
}
