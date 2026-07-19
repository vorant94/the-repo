import type { Route } from "./+types/scryfall";

export async function loader({ request, params }: Route.LoaderArgs) {
  const splat = params["*"];
  if (!splat) {
    return new Response("Not Found", { status: 404 });
  }

  const url = new URL(request.url);
  const targetUrl = `https://api.scryfall.com/${splat}${url.search}`;

  const response = await fetch(targetUrl, {
    method: "GET",
    headers: {
      "user-agent": "Mana Forge (https://mana-forge.vorant94.dev)",
      accept: "application/json",
    },
  });

  const headers = new Headers(response.headers);
  const origin = allowedOrigin(request);
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.append("Vary", "Origin");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function allowedOrigin(request: Request): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) {
    return null;
  }

  const requestOrigin = new URL(request.url).origin;
  if (
    origin === requestOrigin ||
    origin === "https://mana-forge.vorant94.dev"
  ) {
    return origin;
  }

  const originUrl = new URL(origin);
  if (
    originUrl.protocol === "http:" &&
    (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1")
  ) {
    return origin;
  }

  return null;
}
