# Milaan UI review — 2026-10-29

Scope: improve the existing local Astro site at `/` and `/en`. No publication or hosting changes were performed. Existing unrelated workspace changes were retained.

## Findings and implemented improvements

- The initial hero had no game imagery, a long introduction, three competing calls to action, and multiple gradients. Replaced it with concise bilingual copy, a primary catalog action, a secondary featured action, and three real game screenshots. The dark background and warm accent remain.
- The header hid desktop navigation below 1024px but hid its menu toggle above 640px. Navigation is now consistently available at tablet widths, with Escape and link selection closing the menu.
- Small screenshot previews and stacked store actions made catalog cards difficult to scan. Cards now show two larger previews, clearer title/category hierarchy, and compact store/detail actions.
- Search now has an accessible label and supports Vietnamese input without accents. Category filters expose selected state and the result count is announced.
- Clickable card images and titles are real buttons. Added a skip link, visible keyboard focus, anchor offsets, and reduced-motion support.
- The details overlay now uses a native modal dialog with a name, contained keyboard focus, initial close-button focus, Escape handling, scroll locking, and focus restoration.
- Generic `apps.apple.com` destinations are no longer rendered as download buttons. A specific app URL containing an app ID is required.
- Simplified the statistics strip and featured panel to reduce visual competition.

## Verification

- `npm run build`: passed for both static routes after the implementation.
- `git diff --check`: passed.
- Browser: desktop 1440px; tablet 768px; mobile 390px and 320px. No document horizontal overflow observed at the checked sizes.
- Images loaded on the desktop page; no broken images reported by the DOM inspection.
- Puzzle filter: 3 results. Reset: 7 results.
- Accentless search `giai do`: 2 matching descriptions. Unmatched search: empty state and reset work.
- Featured game selection updates its content.
- Mobile and tablet menus open; choosing a link closes the menu; Escape closes it.
- Details dialog opens, focuses Close, keeps Tab inside, closes with Escape, and restores the opener focus.
- English route loads and renders translated content. No browser warning/error logs observed during the checks.
- Screenshots: `desktop.jpg`, `mobile.jpg`.

## Remaining content issues

- Footer Help/Terms/COPPA links still use `#`. Real destinations are needed. Privacy was completed in the follow-up below.
- Ratings, downloads, release dates, history and platform/gameplay claims are existing supplied data and were not independently verified against stores or products.
- External store availability, physical-device behavior, network performance and a full accessibility audit were not verified.

## Privacy links follow-up — 2026-10-29

- Source repository: https://github.com/dungnt8805/zeakar_games . Its CNAME confirms `game.lamian.dev`.
- Added bilingual policy directories at `/privacy` and `/en/privacy`, footer navigation, and a game-specific privacy link in every details dialog.
- Verified HTTP 200 for all seven policy URLs and checked their app names: Aster Strike, Blokito Puzzle, Foodie Grill Pop, Mochi Tiles, Matching Pairs, Math Challenge and Sudoku Challenge.
- `privacy.md` is specific to Matching Pairs; it was not used as a shared policy for all games. Existing policy text remains on the original domain.
- Browser checks: footer opens the directory, both locales display 7 links, Aster Strike dialog points to its own policy. Build passed for all four routes; diff whitespace check passed.
- Screenshot: `privacy.jpg`. No remote repository or production deployment was modified.

## Published media and legacy compatibility — 2026-10-29

User selected the currently published Google Play versions as the source. Refreshed all 7 games from 14 localized listings (VI/VN and EN/US); 78 unique icons/screenshots are now hosted under `/media/games/`. No local development or unapproved art was used. The first published screenshot is used as the banner; each game's complete published gallery is retained. See `google-play-media-manifest.json` for source listing URLs, policy URLs, image hashes and byte counts. `npm run sync:media` repeats the snapshot.

The actual Google Play policy links differ from the initial inferred filenames for three games: Matching Pairs uses `/privacy`, Math Challenge uses `/math_privacy`, and Sudoku uses `/sudoku_policy`. These exact URLs now serve the original policy HTML. The new policy directory moved to `/policies` and `/en/policies`; the footer links to that directory. All seven app-specific links match the published store listings.

Preserved 28 legacy files/routes and supporting assets: 20 repository files verified against Git blob hashes; 2 rendered `.html` aliases from the live site; the original CSS and email-decoding script; and 4 extensionless live policy/terms snapshots. Original filenames, including `blockito-puzzle-tos.html`, are intentional. Policy text, app-ads content and domain remain unchanged. SHA-256 values and build output paths are in `legacy-policy-manifest.json`. Added `.nojekyll` for static GitHub Pages publishing.

Verification: static build passed; the verification script checked every preserved file byte-for-byte, all app policy URLs against the published listing metadata, 78 image hashes, 8 generated pages and hosting files. Browser checks covered Vietnamese catalog icons, English detail gallery on 390px mobile, no broken images in those views, no mobile horizontal overflow, legacy `/privacy` and `/math_privacy.html` policy rendering, and the new 7-game policy directory. Screenshot: `store-media-updated.jpg`.

Ready-to-publish output is in `dist/`; publication instructions are in README.md. This task did not push to the source repo or change the live homepage. Existing ratings/download counts and game description copy were outside the requested media update.

## Production domain recheck — 2026-10-29

Rechecked the requirement that the complete website will replace the homepage at `game.lamian.dev`. All 7 exact app privacy URLs on the production domain returned HTTP 200 and their visible policy text matched the built replacement, including contact emails. Cloudflare rewrites email markup on each response, so raw live-response byte equality is not an appropriate content check; generated output and ZIP bytes still match the preserved-file manifest. Verified all 28 legacy files/routes in the deployment ZIP. The build verification now compares each game's own policy URL with its corresponding Google Play listing by game ID. Details: `production-policy-recheck.json`.

Homepage: `/`. Existing Memory Pairs policy: `/privacy`. New policy directory: `/policies`. These are deliberately separate. Publish the entire build output at the same domain; no app or Google Play policy URL change is needed. No production deployment has been performed.

## GitHub Pages workflow — 2026-10-29

Added `.github/workflows/deploy-pages.yml` for the existing `dungnt8805/zeakar_games` repository (GitHub API confirms default branch `master`). Pull requests build and verify; pushes to `master` and manual runs on `master` deploy the verified `dist/` artifact using GitHub's Pages actions. Other manual branch runs do not deploy. The build uses Node.js 24 and `npm ci`; deployment has only the Pages/OIDC permissions it needs. No source write token or build-output commit is used.

Set Astro `site` to `https://game.lamian.dev` with the default root base path. README describes the one-time Pages source change to GitHub Actions, source files required in the repository, and keeping the custom domain/DNS. Ignored generated Python bytecode and optional local release archives.

Validation: workflow YAML parsed; trigger branches, build verification step, build/deploy dependency and permissions checked. `npm run verify` passed for all 8 generated routes, 28 legacy files/routes and 78 media assets. `git diff --check` passed. GitHub-hosted `npm ci` and actual Actions deployment have not been run; this local checkout has no configured Git remote.

## Seven-language site and privacy translations — 2026-10-29

User selected translation only: preserve existing privacy content and URLs, with no changes to data practices or contacts. English is now the default homepage at `/`; `/en/` remains an alias. Added Vietnamese `/vi/`, Simplified Chinese `/zh/` (HTML `zh-Hans`), French `/fr/`, Thai `/th/`, Japanese `/ja/` and Korean `/ko/`. Shared home/layout components and one locale registry drive navigation, accessible labels, catalog UI, game summaries/features, studio content, footer and policy pages. The compact language picker preserves the current policy/game path. New locales use published English artwork; Vietnamese uses the existing Vietnamese snapshot.

Added 49 localized privacy documents (7 English plus 42 translations) at `/policies/{game}` and `/{locale}/policies/{game}`. Original English policies remain byte-for-byte unchanged at their app URLs, including `/privacy`, `/math_privacy` and `/sudoku_policy`. Original terms remain in English and are linked per game from the directory and policy pages. No new legal terms, contacts or effective dates were authored. Translation pages have a translated provenance note and a link to the original.

`privacy-dictionary.json` translates each substantive source text segment; parameterized introductions and dates retain the appropriate app/provider/date for each source. `scripts/build-privacy-translations.py` fails on unknown text or missing translations and sanitizes translated HTML to remove scripts/styles and decode original Cloudflare-protected email addresses. The complete English snapshots are retained separately. Source coverage is in `privacy-translation-coverage.json`. Translations were prepared by Codex; automated coverage checks do not represent independent native-speaker or legal review.

Validation: `npm run verify` passed with 76 generated pages, 28 original files/routes unchanged, all app URLs matching their published listings, 78 image hashes, complete locale keys and 49 privacy pages. Checks include the original effective dates, applicable child-age thresholds, translation placeholders, page language tags and links from each directory to each game's translation. Browser: 390px checks passed for all seven homepages, all with 7 cards, zero broken loaded images and no document horizontal overflow. Japanese dialog opened the correct translated policy; switching to French retained Aster Strike. The English root is the default and the picker lists all 7 languages. Screenshots: `seven-languages.jpg`, `korean-mobile.jpg`; details: `i18n-browser-checks.json`.

During QA the old dev module graph and a stale browser error tab required a server/tab restart. Checks above were repeated successfully on a clean browser tab after the restart. No production push or deployment was performed. The existing Pages action runs the expanded verification automatically.

## Policy document styling — 2026-10-29

Updated translated privacy pages and all 20 original HTML privacy/terms documents with a shared studio header, game icon, effective-date metadata, warm light reading surface, clearer headings, desktop contents, collapsible mobile contents, document links and back-to-top navigation. The original policy text, dates, contacts and URLs remain unchanged.

Original `public/` and `legacy/` sources remain untouched. Build postprocessing adds marked presentation wrappers; verification strips those wrappers and compares the recovered original HTML to its preserved SHA-256. Localized policy data is unchanged; existing section titles are promoted to semantic headings for presentation.

`npm run verify` passed for all 76 generated routes, 28 original payloads and 49 localized documents. Browser QA covered original `/privacy/` at 390px, a working Security contents anchor at about 110px from the viewport top, menu auto-close, no horizontal overflow, and French Aster Strike on desktop/mobile. The existing Pages workflow handles deployment.
