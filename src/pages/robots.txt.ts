import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site || new URL("https://amsirartrip.com");
  const sitemapUrl = new URL("sitemap-index.xml", baseUrl);

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /_actions/
Disallow: /api/

User-agent: Googlebot
Allow: /
Disallow: /_actions/
Disallow: /api/

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /
Disallow: /_actions/
Disallow: /api/
Crawl-delay: 1

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: FacebookBot
Allow: /

Sitemap: ${sitemapUrl.href}
`;

  return new Response(robotsTxt, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
