import { createRequestHandler } from "react-router";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request: Request) {
    const response = await requestHandler(request);
    const headers = new Headers(response.headers);
    headers.set(
      "Content-Security-Policy",
      "default-src 'self' 'unsafe-inline'; frame-ancestors 'none'; frame-src 'none'; script-src 'self' 'unsafe-inline' static.cloudflareinsights.com; img-src 'self' data: w3.org/svg/2000;",
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
