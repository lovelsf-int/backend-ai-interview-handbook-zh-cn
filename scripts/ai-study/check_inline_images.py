"""Check source-to-HTML image coverage and optionally probe public image hosts."""
import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
HOSTS = {'oss.javaguide.cn', 'javaguide.cn'}

class Images(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'img' and 'ai-study-image' in attrs.get('class', '').split():
            assert attrs.get('loading') == 'lazy'
            assert attrs.get('referrerpolicy') == 'no-referrer'
            assert attrs.get('alt')
            self.images.append(attrs['src'])

def visible(text):
    fence = None
    result = []
    for line in text.splitlines():
        marker = re.match(r'^\s*(`{3,}|~{3,})', line)
        if marker:
            if fence is None:
                fence = marker[1]
            elif marker[1][0] == fence[0] and len(marker[1]) >= len(fence):
                fence = None
            continue
        if fence is None:
            result.append(line)
    return '\n'.join(result)

def approved(url):
    u = urlsplit(url)
    return (u.scheme == 'https' and u.hostname in HOSTS and not u.username and
            not u.password and u.port in (None, 443) and
            re.search(r'\.(png|jpe?g|gif|webp|avif|svg)$', u.path, re.I))

def probe(url):
    try:
        # Ordinary public GET; never supplies cookies, credentials or bypass headers.
        with urlopen(Request(url, headers={'User-Agent': 'AI-study-image-check/1.0'}), timeout=15) as response:
            content_type = response.headers.get('Content-Type', '')
            response.read(256)
            return {'url': url, 'status': response.status, 'content_type': content_type,
                    'ok': response.status == 200 and content_type.startswith('image/')}
    except Exception as exc:
        return {'url': url, 'ok': False, 'error': str(exc)}

def main(check_http=False):
    manifest = json.loads((ROOT / 'docs/public/ai-study-manifest.json').read_text())
    report = {'pages_checked': 0, 'pages_with_images': 0, 'inline_image_references': 0,
              'links_retained': [], 'images': [], 'external_images_copied': False}
    urls = set()
    for page in manifest['pages']:
        md = ROOT / 'docs/ai-study/java-guide' / page['target']
        references = re.findall(r'\[原图：[^\]]*\]\(([^\s)]+)\)', visible(md.read_text()))
        expected = [u for u in references if approved(u)]
        report['links_retained'].extend(u for u in references if not approved(u))
        built = ROOT / 'docs/.vitepress/dist/ai-study/java-guide' / (page['target'][:-3] + '.html')
        parser = Images()
        parser.feed(built.read_text())
        assert Counter(parser.images) == Counter(expected), (page['target'], expected, parser.images)
        report['pages_checked'] += 1
        report['pages_with_images'] += bool(expected)
        report['inline_image_references'] += len(expected)
        urls.update(expected)
    assert report['pages_checked'] == 38 and urls, report
    report['unique_images'] = len(urls)
    if check_http:
        with ThreadPoolExecutor(max_workers=6) as pool:
            report['images'] = list(pool.map(probe, sorted(urls)))
        report['http_ok'] = sum(x['ok'] for x in report['images'])
        report['http_failed'] = sum(not x['ok'] for x in report['images'])
    report['note'] = 'HTTP checks are a snapshot, not a guarantee of future availability or every browser network.'
    target = ROOT / 'docs/public/ai-study-image-report.json'
    target.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check-http', action='store_true')
    main(parser.parse_args().check_http)
