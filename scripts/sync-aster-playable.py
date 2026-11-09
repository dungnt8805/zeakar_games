"""Build the website demo from a Galaxy Shooter checkout with its LFS assets."""

import argparse
import json
import re
import runpy
from pathlib import Path


def replace_once(html: str, old: str, new: str) -> str:
    if html.count(old) != 1:
        raise ValueError(f"Playable template changed. Review the web adaptation for: {old}")
    return html.replace(old, new, 1)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project", type=Path, help="Path to the Galaxy Shooter checkout")
    args = parser.parse_args()

    project = args.project.resolve()
    playable = project / "playable"
    builder = runpy.run_path(str(playable / "tools/build.py"))
    config = json.loads((playable / "config.json").read_text(encoding="utf-8"))
    manifest = json.loads((playable / "assets/manifest.json").read_text(encoding="utf-8"))
    assets = [*manifest["images"].values(), *manifest["audio"].values(), manifest["font"]]
    for asset in assets:
        with (playable / "assets" / asset["file"]).open("rb") as file:
            if file.read(40).startswith(b"version https://git-lfs.github.com/spec/"):
                raise ValueError(f"Missing Git LFS asset: {asset['file']}")

    # The website mode uses the browser lifecycle without enabling preview debug flags.
    html = builder["render"]("web", config, manifest)
    html = replace_once(html, '<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="robots" content="noindex">')
    html = replace_once(html, 'const lang = params.get("lang")', 'const lang = new URLSearchParams(location.search).get("lang")')
    html = replace_once(
        html,
        'default:\nconsole.log("[playable] install →", url);',
        'case "web":\nif (url) window.open(url, "_blank", "noopener,noreferrer");\nbreak;\n'
        'default:\nconsole.log("[playable] install →", url);',
    )
    payload = html.encode("utf-8")
    if len(payload) > config["shared_budget_bytes"] or re.search(r'(?:src|href)\s*=\s*["\']https?://', html):
        raise ValueError("The web demo must stay within the playable budget and bundle its assets locally")

    license_text = (project / "assets/fonts/chakra_petch/OFL.txt").read_bytes()
    output = Path(__file__).resolve().parents[1] / "public/playable/aster-strike"
    output.mkdir(parents=True, exist_ok=True)
    (output / "index.html").write_bytes(payload)
    (output / "Chakra-Petch-OFL.txt").write_bytes(license_text)
    print(f"Built {output / 'index.html'} ({len(payload):,} bytes)")


if __name__ == "__main__":
    main()
