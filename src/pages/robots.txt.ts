import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL("https://amsirartrip.com");
  const sitemapIndexUrl = new URL("sitemap-index.xml", baseUrl);
  const sitemapUrl = new URL("sitemap.xml", baseUrl);

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /_actions/
Disallow: /api/
Content-Signal: search=yes, ai-input=yes, ai-train=yes

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

User-agent: Applebot
Allow: /
Disallow: /_actions/
Disallow: /api/

User-agent: Applebot-Extended
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: GPTBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: FacebookBot
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${sitemapIndexUrl.href}
Sitemap: ${sitemapUrl.href}
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
};
