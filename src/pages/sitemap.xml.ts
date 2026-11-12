import type { APIRoute } from 'astro';
import { GAMES } from '../data/games';
import { ARCADE_GAMES } from '../data/arcade';
import { LOCALES, localizedArcadePath, localizedGamePath, localizedPath } from '../i18n/ui';

export const GET: APIRoute = ({ site }) => {
  const paths = LOCALES.flatMap(lang => [
    localizedPath(lang),
    localizedArcadePath(lang),
    ...ARCADE_GAMES.map(game => localizedArcadePath(lang, game.id)),
    ...GAMES.map(game => localizedGamePath(lang, game.id)),
  ]);
  const entries = paths.map(path => `  <url><loc>${new URL(path, site).href}</loc></url>`);
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
  ].join('\n');
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
