import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { stripLegacyPresentation, preparePolicyHtml } from '../src/lib/policy-presentation.mjs';
const root = resolve(import.meta.dirname, '..');
const read = path => readFile(resolve(root, path));
const policies = JSON.parse(await read('docs/ui-review/legacy-policy-manifest.json'));
for (const file of policies.files) {
  for (const revision of file.revisions ?? []) {
    assert.equal(createHash('sha256').update(await read(revision.archive)).digest('hex'), revision.previousSha256, `Previous policy revision lost: ${file.path}`);
  }
  let bytes = await read(`dist${file.outputPath ?? file.path}`);
  if (file.path.endsWith('.html') || file.outputPath?.endsWith('.html')) {
    const styled = bytes.toString();
    assert(styled.includes('milaan-policy-head:start'), `Missing shared policy style: ${file.path}`);
    bytes = Buffer.from(stripLegacyPresentation(styled));
  }
  assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, `Legacy file changed or missing: ${file.path}`);
}
const dataSource = await read('src/data/games.ts');
const appPolicies = Object.fromEntries([...dataSource.toString().matchAll(/id: '([^']+)',\s+privacyUrl: '(https:\/\/game\.lamian\.dev\/[^']+)'/g)].map(match => [match[1], match[2]]));
const policyUrls = Object.values(appPolicies);
assert.equal(policyUrls.length, 7);
for (const url of policyUrls) {
  assert(policies.files.some(file => file.path === new URL(url).pathname), `App policy URL is not preserved: ${url}`);
}
const media = JSON.parse(await read('src/data/game-media.json'));
assert.equal(Object.keys(media).length, 7);
for (const [id, locales] of Object.entries(media)) {
  for (const locale of ['vi', 'en']) {
    const entry = locales[locale];
    assert(entry?.screenshots.length, `No screenshots for ${id}/${locale}`);
    for (const asset of [entry.icon, entry.banner, ...entry.screenshots]) {
      assert(asset.startsWith('/media/games/'), `Expected a local media snapshot: ${asset}`);
      await access(resolve(root, `dist${asset}`));
    }
  }
}
const mediaManifest = JSON.parse(await read('docs/ui-review/google-play-media-manifest.json'));
for (const listing of mediaManifest.listings) {
  assert.equal(appPolicies[listing.id], listing.app_policy_url, `Published app policy URL changed for ${listing.id}/${listing.locale}`);
}
for (const asset of mediaManifest.assets) {
  assert.equal(createHash('sha256').update(await read(`dist${asset.path}`)).digest('hex'), asset.sha256, `Store image changed: ${asset.path}`);
}
for (const route of ['index.html', 'en/index.html', 'policies/index.html', 'en/policies/index.html']) await access(resolve(root, 'dist', route));
await access(resolve(root, 'dist/.nojekyll'));
for (const id of Object.keys(JSON.parse(await read('src/i18n/messages.json')).en.arcade.games)) await access(resolve(root, 'dist/playable', id, 'index.html'));
assert.equal((await read('dist/CNAME')).toString().trim(), 'lamian.dev');
const messages = JSON.parse(await read('src/i18n/messages.json'));
const translatedPolicies = JSON.parse(await read('src/data/privacy-translations.json'));
const locales = ['en', 'vi', 'zh', 'fr', 'th', 'ja', 'ko'];
const langTags = { en:'en', vi:'vi', zh:'zh-Hans', fr:'fr', th:'th', ja:'ja', ko:'ko' };
const site = `https://${(await read('dist/CNAME')).toString().trim()}`;
const localizedRoute = (locale, route) => `${locale === 'en' ? '' : `/${locale}`}${route}`;
const gameRoutes = Object.keys(appPolicies).map(id => `/games/${id}/`);
const arcadeIds = Object.keys(JSON.parse(await read('src/i18n/messages.json')).en.arcade.games);
const arcadeRoutes = arcadeIds.map(id => `/play/${id}/`);
const policyRoutes = ['/policies/', ...Object.keys(appPolicies).map(id => `/policies/${id}/`)];
const searchRoutes = ['/', '/play/', '/play/privacy/', ...arcadeRoutes, ...gameRoutes, ...policyRoutes];
const sitemap = (await read('dist/sitemap.xml')).toString();
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const expectedUrls = locales.flatMap(locale => searchRoutes.map(route => site + localizedRoute(locale, route)));
assert.deepEqual(sitemapUrls.sort(), expectedUrls.sort(), 'Sitemap must list every canonical page once');
assert((await read('dist/robots.txt')).toString().includes(`Sitemap: ${site}/sitemap.xml`), 'Missing robots.txt sitemap URL');
const llms = (await read('dist/llms.txt')).toString();
const llmsFull = (await read('dist/llms-full.txt')).toString();
for (const route of [...arcadeRoutes, ...gameRoutes]) {
  assert(llms.includes(`](${site}${route})`), `llms.txt is missing ${route}`);
  assert(llmsFull.includes(`URL: ${site}${route}\n`), `llms-full.txt is missing ${route}`);
}

function verifySeo(html, locale, route) {
  assert(html.includes(`<link rel="canonical" href="${site}${localizedRoute(locale, route)}">`), `Wrong canonical: ${locale}${route}`);
  for (const alternate of locales) {
    assert(html.includes(`<link rel="alternate" hreflang="${langTags[alternate]}" href="${site}${localizedRoute(alternate, route)}">`),
      `Missing ${alternate} alternate: ${locale}${route}`);
  }
  assert(html.includes(`<link rel="alternate" hreflang="x-default" href="${site}${route}">`), `Missing x-default: ${locale}${route}`);
}

const englishAlias = (await read('dist/en/index.html')).toString();
verifySeo(englishAlias, 'en', '/');
const verificationToken = process.env.GOOGLE_SITE_VERIFICATION?.trim();
if (verificationToken) {
  const home = (await read('dist/index.html')).toString();
  assert(home.includes(`<meta name="google-site-verification" content="${verificationToken}">`), 'Search Console verification tag is missing');
}

const flattenKeys = (value, prefix = '') => Object.entries(value).flatMap(([key, value]) => typeof value === 'object' ? flattenKeys(value, `${prefix}${key}.`) : [`${prefix}${key}`]).sort();
for (const locale of locales) {
  assert.deepEqual(flattenKeys(messages[locale]), flattenKeys(messages.en), `Translation keys differ: ${locale}`);
  const prefix = locale === 'en' ? '' : `${locale}/`;
  const home = (await read(`dist/${prefix}index.html`)).toString();
  assert(home.includes(`<html lang="${langTags[locale]}"`), `Wrong homepage language: ${locale}`);
  assert(home.includes(messages[locale].page.line1), `Wrong homepage copy: ${locale}`);
  verifySeo(home, locale, '/');
  for (const route of gameRoutes) {
    const path = localizedRoute(locale, route);
    const html = (await read(`dist${path}index.html`)).toString();
    assert(home.includes(`href="${path}"`), `Missing game link on homepage: ${path}`);
    assert(html.includes(`<html lang="${langTags[locale]}"`), `Wrong game page language: ${path}`);
    assert(/<h1\b/.test(html) && html.includes('https://play.google.com/store/apps/details?id='), `Incomplete game page: ${path}`);
    verifySeo(html, locale, route);
  }
  const arcade = (await read(`dist/${prefix}play/index.html`)).toString();
  assert(arcade.includes(`<html lang="${langTags[locale]}"`) && arcade.includes(messages[locale].arcade.title), `Wrong arcade page: ${locale}`);
  verifySeo(arcade, locale, '/play/');
  const arcadeContent = JSON.parse(await read('src/i18n/arcade-games.json'));
  for (const id of arcadeIds) {
    const route = localizedRoute(locale, `/play/${id}/`);
    assert(arcade.includes(`href="${route}"`), `Arcade game not linked: ${route}`);
    const page = (await read(`dist${route}index.html`)).toString();
    const content = arcadeContent[locale]?.[id];
    assert(content?.howTo.length === 3 && content.features.length === 3, `Missing arcade content: ${locale}/${id}`);
    assert(page.includes(`<html lang="${langTags[locale]}"`) && /<h1\b/.test(page), `Incomplete arcade game page: ${route}`);
    assert(page.includes(`/playable/${id}/index.html?lang=`), `Game not embedded: ${route}`);
    assert(page.includes('"@type":"VideoGame"'), `Missing VideoGame structured data: ${route}`);
    await access(resolve(root, `dist/media/arcade/${id}.jpg`));
    verifySeo(page, locale, `/play/${id}/`);
  }
  const directory = (await read(`dist/${prefix}policies/index.html`)).toString();
  for (const [id, policy] of Object.entries(translatedPolicies)) {
    assert.equal(policy.originalUrl, appPolicies[id], `Original policy URL changed: ${id}`);
    const html = policy.locales[locale];
    if (id === 'aster-strike') {
      assert(html.includes('2026-10-30'), `Aster effective date missing: ${locale}`);
      assert(html.includes('href="https://aster.lamian.dev/delete-account"'), `Aster deletion link missing: ${locale}`);
      for (const value of ['30', '90', 'Firebase Authentication', 'Cloud Firestore', 'Cloud Functions for Firebase']) {
        assert(html.includes(value), `Aster account disclosure missing ${value}: ${locale}`);
      }
      assert(!html.includes('Only aggregated, anonymized data'), 'Outdated Aster sharing disclosure');
    }
    assert(html?.length > 1000, `Missing policy translation: ${locale}/${id}`);
    assert(!/<script|<style|data-cfemail|\{(?:app|provider|date)\}/i.test(html), `Unresolved/unsafe policy markup: ${locale}/${id}`);
    const document = (await read(`dist/${prefix}policies/${id}/index.html`)).toString();
    assert(document.includes(`<html lang="${langTags[locale]}"`), `Wrong policy language: ${locale}/${id}`);
    assert(document.includes(preparePolicyHtml(html).html), `Translated document differs from source: ${locale}/${id}`);
    assert(document.includes(policy.originalUrl), `No original policy link: ${locale}/${id}`);
    assert(directory.includes(`/${prefix}policies/${id}`), `Policy not linked from directory: ${locale}/${id}`);
    // Translations must preserve source dates and the applicable child-age thresholds.
    for (const date of policy.locales.en.match(/\d{4}-\d{2}-\d{2}/g) ?? []) assert(html.includes(date), `Effective date changed: ${locale}/${id}`);
    assert(html.includes(id === 'memory-pairs' || id === 'math-challenge' || id === 'sudoku-challenge' ? '13' : '16'), `Child-age threshold missing: ${locale}/${id}`);
  }
}
console.log(`Verified ${policies.files.length} policy/support files against approved hashes, archived revisions, 7 app URLs, ${mediaManifest.assets.length} store images, 7 site languages and 49 complete privacy documents.`);
console.log(`Verified sitemap and SEO metadata for ${expectedUrls.length} canonical URLs, including ${gameRoutes.length * locales.length} game pages and ${arcadeRoutes.length * locales.length} web game pages.`);
