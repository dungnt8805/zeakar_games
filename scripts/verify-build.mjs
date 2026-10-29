import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const root = resolve(import.meta.dirname, '..');
const read = path => readFile(resolve(root, path));
const policies = JSON.parse(await read('docs/ui-review/legacy-policy-manifest.json'));
for (const file of policies.files) {
  const bytes = await read(`dist${file.outputPath ?? file.path}`);
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
assert.equal((await read('dist/CNAME')).toString().trim(), 'game.lamian.dev');
const messages = JSON.parse(await read('src/i18n/messages.json'));
const translatedPolicies = JSON.parse(await read('src/data/privacy-translations.json'));
const locales = ['en', 'vi', 'zh', 'fr', 'th', 'ja', 'ko'];
const langTags = { en:'en', vi:'vi', zh:'zh-Hans', fr:'fr', th:'th', ja:'ja', ko:'ko' };
const flattenKeys = (value, prefix = '') => Object.entries(value).flatMap(([key, value]) => typeof value === 'object' ? flattenKeys(value, `${prefix}${key}.`) : [`${prefix}${key}`]).sort();
for (const locale of locales) {
  assert.deepEqual(flattenKeys(messages[locale]), flattenKeys(messages.en), `Translation keys differ: ${locale}`);
  const prefix = locale === 'en' ? '' : `${locale}/`;
  const home = (await read(`dist/${prefix}index.html`)).toString();
  assert(home.includes(`<html lang="${langTags[locale]}"`), `Wrong homepage language: ${locale}`);
  assert(home.includes(messages[locale].page.line1), `Wrong homepage copy: ${locale}`);
  const directory = (await read(`dist/${prefix}policies/index.html`)).toString();
  for (const [id, policy] of Object.entries(translatedPolicies)) {
    assert.equal(policy.originalUrl, appPolicies[id], `Original policy URL changed: ${id}`);
    const html = policy.locales[locale];
    assert(html?.length > 1000, `Missing policy translation: ${locale}/${id}`);
    assert(!/<script|<style|data-cfemail|\{(?:app|provider|date)\}/i.test(html), `Unresolved/unsafe policy markup: ${locale}/${id}`);
    const document = (await read(`dist/${prefix}policies/${id}/index.html`)).toString();
    assert(document.includes(`<html lang="${langTags[locale]}"`), `Wrong policy language: ${locale}/${id}`);
    assert(document.includes(html), `Translated document differs from source: ${locale}/${id}`);
    assert(document.includes(policy.originalUrl), `No original policy link: ${locale}/${id}`);
    assert(directory.includes(`/${prefix}policies/${id}`), `Policy not linked from directory: ${locale}/${id}`);
    // Translations must preserve source dates and the applicable child-age thresholds.
    for (const date of policy.locales.en.match(/\d{4}-\d{2}-\d{2}/g) ?? []) assert(html.includes(date), `Effective date changed: ${locale}/${id}`);
    assert(html.includes(id === 'memory-pairs' || id === 'math-challenge' || id === 'sudoku-challenge' ? '13' : '16'), `Child-age threshold missing: ${locale}/${id}`);
  }
}
console.log(`Verified ${policies.files.length} unchanged legacy files, 7 app URLs, ${mediaManifest.assets.length} store images, 7 site languages and 49 complete privacy documents.`);
