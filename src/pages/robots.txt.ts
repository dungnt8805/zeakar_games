import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => new Response(
  `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', site).href}\n# LLM-readable site map: ${new URL('/llms.txt', site).href}\n`,
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);
