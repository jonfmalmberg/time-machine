#!/usr/bin/env python3
"""Check each song's release year against MusicBrainz (DECISIONS.md D13; proposal 2026-11-24-validation.md).

For a song, MusicBrainz is asked for recordings with that title by that artist. Among the answers whose title
and artist match, the earliest first release date is taken. The song then gets, under `released`:
    "check": {"by": "musicbrainz", "state": "checked" | "earlier", "year": <their year>, "id": <recording id>}
`checked` = their earliest official release and our year differ by at most one. `earlier` = they have an official
release more than a year before ours, so ours may be a chart or reissue year; our year is left as it is and
both are kept for review. Their year later than ours = nothing is written: MusicBrainz often holds only later
reissues of old records, which says nothing against an earlier year. No matching recording = nothing written.

  python3 tools/check_musicbrainz.py [--scope c:JP] [--limit N] [--write]
Answers are cached in .cache/mb/, so a rerun asks only for what is new. One request a second (their rule).
"""
import argparse, glob, json, os, re, sys, time, unicodedata, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data')
CACHE = os.path.join(ROOT, '.cache', 'mb')
UA = 'WorldMusicTimeMachine/0.1 (https://github.com/jonfmalmberg/time-machine)'
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from merge_duplicates import read, write   # noqa: E402


def key(t):
    t = unicodedata.normalize('NFKC', t or '').casefold().replace('œ', 'oe').replace('æ', 'ae').replace('ß', 'ss')
    t = ''.join(c for c in unicodedata.normalize('NFKD', t) if not unicodedata.combining(c))
    t = re.sub(r'[\(\[]\s*(feat|ft|featuring|with)\b[^\)\]]*[\)\]]', '', t)
    return re.sub(r'[^\w]+', '', t, flags=re.UNICODE)


def forms(title):
    """A title may carry a romanisation or translation in brackets: each part counts as a form of it."""
    out = {key(title)}
    m = re.match(r'^(.*?)\s*[\(\[](.+?)[\)\]]\s*$', title or '')
    if m:
        out.update({key(m.group(1)), key(m.group(2))})
    out.add(key(re.sub(r'\s+-\s+.*$', '', title or '')))
    return {x for x in out if x}


def esc(s):
    return re.sub(r'([+\-&|!(){}\[\]^"~*?:\\/])', r'\\\1', s)


def parts(name):
    """'都はるみ (Harumi Miyako)' -> ['都はるみ', 'Harumi Miyako']: a name written with its romanisation is two names."""
    m = re.match(r'^(.*?)\s*[\(\[](.+?)[\)\]]\s*$', name or '')
    return [m.group(1), m.group(2)] if m and m.group(1) else [name]


def fetch(q):
    url = 'https://musicbrainz.org/ws/2/recording?fmt=json&limit=50&query=' + urllib.parse.quote(q)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30) as r:
                d = json.load(r)
            time.sleep(1.05)
            return d
        except Exception as e:                                  # noqa: BLE001
            code = getattr(e, 'code', None)
            if attempt == 3 or (code and code not in (429, 503)):
                return None
            time.sleep(3 * (attempt + 1))


def ask(song_id, title, artist):
    """Recordings by that artist with that title. Each keeps the date of its earliest OFFICIAL release: the plain
    'first release date' also counts bootlegs and mis-dated entries."""
    p = os.path.join(CACHE, song_id + '.json')
    if os.path.exists(p):
        return json.load(open(p, encoding='utf-8'))
    slim = []
    for t in dict.fromkeys(parts(title)):
        for n in dict.fromkeys(parts(artist)):
            d = fetch('recording:"%s" AND artist:"%s"' % (esc(t), esc(n)))
            if d is None:
                return None
            for r in d.get('recordings', []):
                dates = [x.get('date') for x in r.get('releases', []) if x.get('status') == 'Official' and x.get('date')]
                slim.append({'id': r['id'], 'title': r.get('title'), 'date': min(dates) if dates else None, 'score': r.get('score'),
                             'artists': [a.get('name') for a in r.get('artist-credit', [])] + [a.get('artist', {}).get('name') for a in r.get('artist-credit', [])]})
            if slim:
                break
        if slim:
            break
    os.makedirs(CACHE, exist_ok=True)
    json.dump(slim, open(p, 'w', encoding='utf-8'), ensure_ascii=False)
    return slim


def judge(song, artist_names, answers):
    want_t, want_a = forms(song['title']), {key(x) for n in artist_names if n for x in parts(n) if x}
    best = None
    for r in answers or []:
        if (r.get('score') or 0) < 80 or not r.get('date'):
            continue
        if not (forms(r.get('title') or '') & want_t):
            continue
        got_a = {key(n) for n in r.get('artists') or [] if n}
        if not any(a in got_a or any(a in g or g in a for g in got_a if len(g) > 3) for a in want_a):
            continue
        y = int(r['date'][:4])
        if best is None or y < best[0]:
            best = (y, r['id'])
    if not best:
        return None
    ours = (song.get('released') or {}).get('year')
    if ours is None:
        return None
    if best[0] > ours + 1:
        return None      # they only know later issues (reissues, compilations): that says nothing against an earlier year
    return {'by': 'musicbrainz', 'state': 'checked' if abs(best[0] - ours) <= 1 else 'earlier', 'year': best[0], 'id': best[1]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--scope', default='c:'); ap.add_argument('--limit', type=int, default=0); ap.add_argument('--write', action='store_true')
    ap.add_argument('--cached-only', action='store_true', help='judge only songs already answered; ask nothing')
    a = ap.parse_args()
    files = sorted(glob.glob(os.path.join(DATA, 'songs', '*.json')))
    songs = {p: read(p) for p in files}
    by_id = {s['id']: s for rows in songs.values() for s in rows}
    artists = {r['id']: r for p in glob.glob(os.path.join(DATA, 'artists', '*.json')) for r in read(p)}
    wanted = []
    for p in sorted(glob.glob(os.path.join(DATA, 'links', '**', '*.json'), recursive=True)):
        for l in read(p):
            if l.get('song') and str(l.get('scope', '')).startswith(a.scope) and l['song'] not in wanted and l['song'] in by_id:
                wanted.append(l['song'])
    wanted = list(dict.fromkeys(wanted))
    if a.limit:
        wanted = wanted[:a.limit]
    tally = {'checked': 0, 'earlier': 0, 'no match': 0, 'no year of ours': 0, 'failed': 0}
    for n, sid in enumerate(wanted, 1):
        s = by_id[sid]
        names = [artists[c['artist']]['name'] for c in s.get('credits', []) if c.get('role', 'main') == 'main' and c['artist'] in artists]
        names += [x for c in s.get('credits', []) if c['artist'] in artists for x in artists[c['artist']].get('aliases', [])]
        if not names:
            tally['no match'] += 1; continue
        if a.cached_only and not os.path.exists(os.path.join(CACHE, sid + '.json')):
            tally['not asked'] = tally.get('not asked', 0) + 1; continue
        answers = ask(sid, s['title'], names[0])
        if answers is None:
            tally['failed'] += 1; continue
        if (s.get('released') or {}).get('year') is None:
            tally['no year of ours'] += 1; continue
        v = judge(s, names, answers)
        if v:
            s.setdefault('released', {})['check'] = v; tally[v['state']] += 1
        else:
            s.get('released', {}).pop('check', None); tally['no match'] += 1
        if n % 200 == 0:
            print(n, 'of', len(wanted), tally, flush=True)
    print('songs:', len(wanted), tally)
    if a.write:
        for p, rows in songs.items():
            write(p, rows)
        print('written')


if __name__ == '__main__':
    main()
