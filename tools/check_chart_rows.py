#!/usr/bin/env python3
"""Evidence check for chart candidates: is each row's title and each row's artist on its Wikipedia page?

  python3 tools/check_chart_rows.py work/2026-11-24-wikicharts/chart.rows.json --out work/2026-11-24-wikicharts/chart.check.json

The same test as tools/check_evidence.py (its fetch, its reading of the page text, its normalising), run once per
page instead of once per claim because one page carries hundreds of rows. A row passes only when both strings are
found on the live page. Result per row: 'found', 'title not found', 'artist not found', or 'no page'.
"""
import argparse, collections, json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from check_evidence import fetch, text_of, norm, BOT   # noqa: E402


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('rows'); ap.add_argument('--out', required=True); a = ap.parse_args()
    R = json.load(open(a.rows, encoding='utf-8'))
    pages, out, tally = {}, [], collections.Counter()
    for r in R:
        u = r['url']
        if u not in pages:
            m, body = fetch(u)
            raw = text_of(body) if body else ''
            pages[u] = None if (not body or (len(raw) < 3000 and BOT.search(raw))) else norm(raw)
            if len(pages) % 50 == 0: print('pages', len(pages), flush=True)
        t = pages[u]
        res = 'no page' if t is None else 'title not found' if norm(r['title']) not in t else 'artist not found' if norm(r['artist']) not in t else 'found'
        tally[res] += 1
        out.append({'cc': r['cc'], 'year': r['year'], 'title': r['title'], 'artist': r['artist'], 'url': u, 'result': res})
    json.dump({'date': time.strftime('%Y-%m-%d'), 'rows': out}, open(a.out, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(dict(tally))


if __name__ == '__main__':
    main()
