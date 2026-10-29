# Milaan Games website

Astro + React with English as the default (`/`). Additional languages: Vietnamese (`/vi/`), Simplified Chinese (`/zh/`), French (`/fr/`), Thai (`/th/`), Japanese (`/ja/`) and Korean (`/ko/`). `/en/` remains an English alias. Public game imagery is a snapshot of the corresponding live Google Play listings; local game development assets are not used.

## Develop and verify

```sh
npm install
npm run dev -- --background
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
npm run verify
```

`npm run verify` builds `dist/` and checks the legacy policy file hashes, all seven app policy paths, downloaded media, all seven site languages, 49 complete privacy documents, four extensionless legacy aliases, and GitHub Pages configuration.

## Refresh published game imagery

```sh
npm run sync:media
npm run verify
```

This reads Google Play in Vietnamese/Vietnam and English/US, downloads the currently published icon and screenshots, and generates `src/data/game-media.json`. Media provenance and hashes are recorded in `docs/ui-review/google-play-media-manifest.json`. Python 3, curl and network access are required. Existing app policy URLs and policy content are not modified by this command.

## Deploy automatically with GitHub Actions

The workflow is `.github/workflows/deploy-pages.yml`. It builds this source and publishes `dist/` directly to GitHub Pages using the built-in `GITHUB_TOKEN`; no personal access token or `gh-pages` branch is needed.

The target repository `dungnt8805/zeakar_games` currently uses **master** as its default branch. The workflow:

- Builds and checks pull requests targeting `master`, without deploying them.
- Builds and deploys on pushes to `master`.
- Allows manual runs from **Actions → Build and deploy GitHub Pages → Run workflow**. Select `master` to deploy; runs on other branches only build.
- Runs `npm ci` with Node.js 24, then `npm run verify`. A missing or modified legacy policy blocks deployment.

### One-time repository setup

1. Put this project's **source files at the root of the existing repository** on `master`, including `.github/`, `src/`, `scripts/`, `public/`, `legacy/`, `docs/ui-review/*manifest.json`, `package.json`, `package-lock.json` and Astro/TypeScript configuration. Do not upload only the old deployment ZIP for this workflow: it contains compiled output, not the source required to build. Do not commit `node_modules/` or `dist/`.
2. In the repository's **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
3. Retain **game.lamian.dev** under Custom domain and retain the existing DNS records. Keep Enforce HTTPS enabled once available. The Astro configuration uses this domain at the root; do not set a `/zeakar_games` base path.
4. Push the source/workflow to `master`, or run the workflow manually. If an environment protection rule requests approval, approve the `github-pages` deployment in Actions.
5. Check `/`, `/en/`, `/policies/`, the seven original app policy URLs below, and `/app-ads.txt` after the deployment succeeds.

The workflow publishes the entire verified build, including all legacy policy files, `CNAME`, `.nojekyll`, `_astro/`, and `media/`. It does not commit build output back into the source branch. Existing policy URLs in apps and Google Play require no changes.

## Localized privacy policies

`/policies/` is the default English directory. Other languages use `/{locale}/policies/`; each game has a readable policy at `/{locale}/policies/{game-id}/` (omit `/en` for canonical English). The language picker preserves the current game/page. Every translated policy links to its original English URL.

The original policy URLs in the table below continue to serve **the unchanged original English documents**. The user requested translations only: no data practices, contact details, effective dates or original app policy URLs were revised. Terms of service remain available through their original English links from the directory.

Translations are maintained in `src/i18n/privacy-dictionary.json`, with original text segments in `src/i18n/privacy-source.json`. Generate localized documents without calling any external service:

```sh
npm run sync:policies
npm run verify
```

The generation command refuses unmapped source text or missing translations. The build verifier checks all locale routes, original URLs, effective dates and child-age thresholds. Site text and game descriptions are in `src/i18n/messages.json` and `src/i18n/game-texts.json`. Non-Vietnamese pages use the published English game artwork; this task does not create translated screenshots.

### Optional manual upload

Run `npm run verify` and publish the **contents of `dist/`** to the existing static hosting root, including hidden files. The optional deployment ZIP contains those built files at its root; it is useful for manual uploads, not as the input for the Actions workflow.

## Original policy URLs remain unchanged

| Game | Existing privacy URL |
| --- | --- |
| Aster Strike | https://game.lamian.dev/aster-privacy-policy.html |
| Blokito Puzzle | https://game.lamian.dev/blokito-puzzle-privacy.html |
| Foodie: Grill Pop | https://game.lamian.dev/grillpop-privacy.html |
| Mochi Tiles | https://game.lamian.dev/mochi-tiles-policy.html |
| Memory Pairs | https://game.lamian.dev/privacy |
| Math Challenge | https://game.lamian.dev/math_privacy |
| Sudoku Challenge | https://game.lamian.dev/sudoku_policy |

`public/` contains the original HTML policies and terms, legacy Markdown files, rendered `/privacy.html` and `/tos.html` aliases, their supporting CSS and email script, `app-ads.txt`, and `CNAME`. `legacy/` contains exact live snapshots served through `/privacy`, `/math_privacy`, `/sudoku_policy`, and `/tos` routes. `docs/ui-review/legacy-policy-manifest.json` records their source and hashes. The old spelling `blockito-puzzle-tos.html` is intentional and preserved. `/policies/` is the new directory of per-game policies; `/privacy` and `/privacy.html` remain the original Matching Pairs policy. The table above matches the actual privacy links currently registered on Google Play, including extensionless paths.

The current snapshot was retrieved on 2026-10-29. Any later upstream policy or app-ads changes should be incorporated before publishing; update the provenance manifest only after reviewing the replacement content. Existing rating/download figures and gameplay descriptions were not refreshed as part of the image update.

Workflow references: [Astro on GitHub Pages](https://docs.astro.build/en/guides/deploy/github/) and [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Policy presentation

`npm run build` builds Astro and applies the shared legal-document layout to the 20 original HTML policy/terms routes. Styling is added as marked, removable HTML wrappers; the source documents in `public/` and `legacy/` remain untouched. The build verifier removes only those presentation wrappers and checks the original payload against its preserved SHA-256 value. Translated policy pages use the same stylesheet, semantic section headings, desktop contents navigation and a collapsible mobile contents menu. Policy text, dates, contacts and app URLs are preserved.
