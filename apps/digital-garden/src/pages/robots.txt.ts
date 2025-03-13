import type { APIContext, APIRoute } from "astro";

export const GET: APIRoute = ({ site }: APIContext) => {
  const sitemapUrl = new URL("sitemap-index.xml", site);
  return new Response(getRobotsTxt(sitemapUrl));
};

const getRobotsTxt = (sitemapUrl: URL) => `
User-agent: *
Allow: /

Sitemap: ${sitemapUrl.href}
`;
