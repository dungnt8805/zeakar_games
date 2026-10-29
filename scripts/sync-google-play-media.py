#!/usr/bin/env python3
"""Snapshot the public Google Play icon/screenshots for the existing catalog.

Requires Python 3 and curl. Run from any directory. Optional --page-cache /tmp
uses already fetched lamian-play-<game>-<locale>.html files for this run.
Media and its provenance are generated; app policy URLs are never modified.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
import argparse
import json
import re
import subprocess
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]

class Listing(HTMLParser):
    def __init__(self):
        super().__init__()
        self.icon = None
        self.title = None
        self.screenshots = {}
        self.privacy_url = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a' and attrs.get('href'):
            link = urlparse(attrs['href'])
            if link.hostname == 'game.lamian.dev' and any(part in link.path for part in ['priv', 'policy']):
                self.privacy_url = attrs['href']
        if tag == 'meta' and attrs.get('property') == 'og:image':
            self.icon = attrs.get('content')
        if tag == 'meta' and attrs.get('property') == 'og:title':
            self.title = attrs.get('content')
        if tag == 'img' and 'data-screenshot-index' in attrs:
            self.screenshots[int(attrs['data-screenshot-index'])] = attrs['src']

def curl(url):
    return subprocess.check_output(['curl', '-sSL', '--fail', '--retry', '2', '--max-time', '45', url])

def sized(url, size):
    if not url.startswith('https://play-lh.googleusercontent.com/'):
        raise ValueError('Unexpected media host: ' + url)
    return url.split('=')[0] + '=' + size

def extension(body):
    if body.startswith(b'\x89PNG'): return 'png'
    if body.startswith(b'\xff\xd8\xff'): return 'jpg'
    if body[:4] == b'RIFF' and body[8:12] == b'WEBP': return 'webp'
    raise ValueError('Downloaded response is not a supported image')

def main():
    args = argparse.ArgumentParser()
    args.add_argument('--page-cache', type=Path)
    options = args.parse_args()
    source = (ROOT / 'src/data/games.ts').read_text()
    apps = re.findall(r"id: '([^']+)',\s+privacyUrl:.*?googlePlayUrl: '([^']+)'", source, re.S)
    if len(apps) != 7: raise ValueError('Expected the existing 7-game catalog')
    listings = []
    for game, app_url in apps:
        for locale in ['vi', 'en']:
            url = app_url + '&hl=' + locale + '&gl=' + ('VN' if locale == 'vi' else 'US')
            cached = options.page_cache / f'lamian-play-{game}-{locale}.html' if options.page_cache else None
            body = cached.read_text() if cached and cached.exists() else curl(url).decode()
            listing = Listing()
            listing.feed(body)
            if not listing.icon or not listing.screenshots or not listing.title:
                raise ValueError('Missing public listing media: ' + url)
            listings.append((game, locale, url, listing))
    tasks = {}
    for game, _, _, listing in listings:
        urls = [sized(listing.icon, 's256')] + [sized(url, 'w720') for _, url in sorted(listing.screenshots.items())]
        for url in urls: tasks[(game, url)] = None

    def download(task):
        game, url = task
        body = curl(url)
        path = Path('media/games') / game / (sha256(url.encode()).hexdigest()[:16] + '.' + extension(body))
        target = ROOT / 'public' / path
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists() or target.read_bytes() != body: target.write_bytes(body)
        return task, {'path': '/' + path.as_posix(), 'source': url, 'sha256': sha256(body).hexdigest(), 'bytes': len(body)}

    media = dict(ThreadPoolExecutor(max_workers=6).map(download, tasks))
    catalog, provenance = {}, []
    for game, locale, url, listing in listings:
        icon = media[(game, sized(listing.icon, 's256'))]['path']
        screenshots = list(dict.fromkeys(media[(game, sized(value, 'w720'))]['path'] for _, value in sorted(listing.screenshots.items())))
        catalog.setdefault(game, {})[locale] = {'icon': icon, 'banner': screenshots[0], 'screenshots': screenshots}
        provenance.append({'id': game, 'locale': locale, 'listing': url, 'published_title': listing.title, 'app_policy_url': listing.privacy_url, 'screenshot_count': len(screenshots)})
    (ROOT / 'src/data/game-media.json').write_text(json.dumps(catalog, indent=2) + '\n')
    report = {'fetched_at': datetime.now(timezone.utc).isoformat(), 'source': 'Public Google Play listing; no local draft game assets used.', 'listings': provenance, 'assets': list(media.values())}
    (ROOT / 'docs/ui-review/google-play-media-manifest.json').write_text(json.dumps(report, indent=2) + '\n')
    print(f'Synced {len(apps)} games, {len(listings)} localized listings, {len(media)} unique images ({sum(a["bytes"] for a in media.values()):,} bytes).')

if __name__ == '__main__': main()
