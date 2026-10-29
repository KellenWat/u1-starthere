"""Catch broken relative links in the checked-in GitHub Pages output."""
from html.parser import HTMLParser
from pathlib import Path
import unittest
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class PageLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        self.urls.extend(value for key, value in attrs if key in ("href", "src") and value)


class SiteLinksTest(unittest.TestCase):
    def test_generated_page_links_and_assets_resolve_inside_project(self):
        pages = [ROOT / "index.html", ROOT / "catalog/index.html", ROOT / "start/index.html", ROOT / "plan/index.html", ROOT / "fixes/index.html",
                 *sorted((ROOT / "item").glob("*/index.html"))]
        self.assertGreater(len(pages), 3)
        for page in pages:
            parser = PageLinks()
            parser.feed(page.read_text(encoding="utf-8"))
            for url in parser.urls:
                parsed = urlsplit(url)
                if parsed.scheme or parsed.netloc or not parsed.path:
                    continue
                with self.subTest(page=page.relative_to(ROOT), url=url):
                    self.assertFalse(parsed.path.startswith("/"), "Use project-relative URLs for Pages")
                    target = (page.parent / unquote(parsed.path)).resolve()
                    self.assertTrue(target.is_relative_to(ROOT))
                    self.assertTrue(target.exists(), f"Missing target: {target}")


if __name__ == "__main__":
    unittest.main()
