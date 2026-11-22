import type { APIRoute } from "astro";

const AI_AND_SEARCH_AGENTS = [
  "*",
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "PerplexityBot",
  "Perplexity-User",
  "FacebookBot",
  "CCBot",
] as const;

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL("https://amsirartrip.com");
  const sitemapIndexUrl = new URL("sitemap-index.xml", baseUrl);
  const sitemapUrl = new URL("sitemap.xml", baseUrl);

  const agentRules = AI_AND_SEARCH_AGENTS.map(
    (agent) => `User-agent: ${agent}\nAllow: /\nDisallow: /_actions/\nDisallow: /api/`,
  ).join("\n\n");

  const robotsTxt = `${agentRules}\n\nSitemap: ${sitemapIndexUrl.href}\nSitemap: ${sitemapUrl.href}\n`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
};
