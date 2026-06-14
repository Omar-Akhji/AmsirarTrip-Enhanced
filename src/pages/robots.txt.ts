import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site || new URL("https://amsirartrip.com");
  const sitemapUrl = new URL("sitemap-index.xml", baseUrl);

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /booking/
Disallow: /account/
Disallow: /search/

User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /booking/
Disallow: /account/

User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /booking/
Disallow: /account/
Crawl-delay: 1

User-agent: GPTBot
Allow: /
Disallow: /api/
Disallow: /booking/
Disallow: /account/

User-agent: ChatGPT-User
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: FacebookBot
Allow: /

Sitemap: ${sitemapUrl.href}`;

  return new Response(robotsTxt, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
