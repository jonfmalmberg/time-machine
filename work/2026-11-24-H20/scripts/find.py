#!/usr/bin/env python3
"""H20 step 1: find each song's first-release year on Wikipedia (decision D18 order).

Pages are FOUND with the MediaWiki API (batched title look-ups, redirects followed).
Quotes are NOT taken from here: step 2 (quote.py) fetches each chosen page as ?action=raw
and copies the supporting line from that raw text.

  python3 find.py <songs.json> <out candidates.json>
"""
import json, os, re, sys, time, unicodedata, urllib.parse, urllib.request, hashlib

UA = 'time-machine-research/1 (+https://github.com/jonfmalmberg/time-machine)'
CACHE = os.environ.get('H20_CACHE', '/tmp/h20cache')
os.makedirs(CACHE, exist_ok=True)
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..')

def api(lang, titles):
    """Return {requested title: (final title, wikitext)} for up to 50 titles, following redirects."""
    out, todo = {}, []
    for t in titles:
        p = os.path.join(CACHE, hashlib.sha256(f'{lang}|{t}'.encode()).hexdigest()[:24] + '.json')
        if os.path.exists(p): out[t] = tuple(json.load(open(p))) if json.load(open(p)) else None
        else: todo.append(t)
    for i in range(0, len(todo), 50):
        chunk = todo[i:i + 50]
        q = urllib.parse.urlencode({'action': 'query', 'format': 'json', 'formatversion': 2, 'redirects': 1,
                                    'prop': 'revisions', 'rvprop': 'content', 'rvslots': 'main', 'titles': '|'.join(chunk)})
        for attempt in range(4):
            try:
                req = urllib.request.Request(f'https://{lang}.wikipedia.org/w/api.php', data=q.encode(), headers={'User-Agent': UA})
                d = json.load(urllib.request.urlopen(req, timeout=60)); break
            except Exception as e:
                print('api retry', lang, e, file=sys.stderr); time.sleep(5 + 5 * attempt)
        else:
            continue
        qd = d.get('query', {})
        norm = {n['from']: n['to'] for n in qd.get('normalized', [])}
        red = {}
        for r in qd.get('redirects', []): red[r['from']] = r['to']
        pages = {p['title']: p for p in qd.get('pages', [])}
        for t in chunk:
            t1 = norm.get(t, t); t2 = red.get(t1, t1); t2 = red.get(t2, t2)
            pg = pages.get(t2)
            val = None
            if pg and not pg.get('missing') and not pg.get('invalid') and pg.get('revisions'):
                val = (pg['title'], pg['revisions'][0]['slots']['main']['content'], t1 != t2)
            out[t] = val
            p = os.path.join(CACHE, hashlib.sha256(f'{lang}|{t}'.encode()).hexdigest()[:24] + '.json')
            json.dump(val, open(p, 'w'))
        time.sleep(0.5)
    return out

def norm(s):
    s = unicodedata.normalize('NFKD', s or '')
    s = ''.join(c for c in s if not unicodedata.combining(c)).lower()
    s = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', r'\1', s)
    s = s.replace('&amp;', '&').replace(' and ', ' & ')
    s = re.sub(r'[^\w&]+', ' ', s)
    s = re.sub(r'^the ', '', s.strip())
    return re.sub(r'\s+', ' ', s).strip()

SPLIT = re.compile(r'\s+(?:featuring|feat\.?|ft\.?|with|x|vs\.?|and|&|y|e|et|und|med|og|och)\s+|\s*[/,+]\s*', re.I)
def artist_parts(a):
    parts = [a] + [p for p in SPLIT.split(a) if p]
    return [norm(p) for p in parts if len(norm(p)) >= 2]

def title_variants(t):
    v = [t]
    t2 = re.sub(r'\s*[\(\[][^\)\]]*[\)\]]\s*$', '', t).strip()   # trailing "(Live)" etc.
    if t2 and t2 != t: v.append(t2)
    return v

# ---------- infobox reading ----------
IB_SONG = re.compile(r'\{\{\s*(?:infobox[ _](?:song|single|musical composition|standard)|ficha de (?:sencillo|canción)|info/(?:single|canção|música)|infobox musique|infobox chanson|infobox song|single-infobox|song-infobox|infobox single|brano musicale|singolo|сингл|песня|карточка сингла|şarkı bilgi kutusu|bilgi kutusu şarkı|tabla de sencillo|infocaseta single|infobox singel|infoboks single|infobox muziekalbum|楽曲|シングル)', re.I)
IB_ALBUM = re.compile(r'\{\{\s*(?:infobox[ _]album|ficha de álbum|info/álbum|infobox musique \(œuvre\)|album|альбом|albüm bilgi kutusu|infobox album|ficha de álbum|infobox album)', re.I)
REL = r'(?:released|release(?:d)?_date|lanzado|lanzamiento|publicación|publicado|publicación|sortie|sorti|date de sortie|veröffentlichung|veröffentlicht|erscheinungsjahr|pubblicazione|data|lançado|lançamento|выпущен|дата выпуска|выпуск|yayımlanma|yayınlanma|yayın_tarihi|yayın tarihi|çıkış tarihi|発売日|リリース|utgiven|utgivelse|udgivet|julkaistu|wydany|vydáno|megjelent|lansare|releasedatum|uitgebracht)'
ART = r'(?:artist|artista|artiste|interprète|interpret|künstler|исполнитель|sanatçı|アーティスト|artiest|esittäjä|wykonawca|előadó|cântăreț)'

def infoboxes(wt):
    """Yield (kind, start, end) of each song/album infobox, matched by braces."""
    for m in re.finditer(r'\{\{', wt):
        head = wt[m.start():m.start() + 80]
        kind = 'song' if IB_SONG.match(head) else ('album' if IB_ALBUM.match(head) else None)
        if not kind: continue
        depth, i = 0, m.start()
        while i < len(wt):
            if wt.startswith('{{', i): depth += 1; i += 2; continue
            if wt.startswith('}}', i):
                depth -= 1; i += 2
                if depth == 0: break
                continue
            i += 1
        yield kind, m.start(), i

def field(box, names):
    """Return (whole raw line, value) of the first field named in names."""
    m = re.search(r'(^|\n)(\s*\|\s*' + names + r'\s*=([^\n]*))', box, re.I)
    if not m: return None, None
    return m.group(2).strip('\n'), m.group(3)

YEAR = re.compile(r'(?<!\d)(1[89]\d\d|20[0-2]\d)(?!\d)')
def years_in(v):
    v = re.sub(r'<ref[^>]*/>', ' ', v); v = re.sub(r'(?s)<ref.*?</ref>', ' ', v)
    v = re.sub(r'<!--.*?-->', ' ', v)
    return [int(y) for y in YEAR.findall(v)]

def artist_ok(val, parts):
    nv = norm(val or '')
    if not nv: return False
    return any(p and (p in nv or (len(nv) >= 4 and nv in p)) for p in parts)

def from_song_page(wt, parts, title):
    for kind, s, e in infoboxes(wt):
        box = wt[s:e]
        aline, aval = field(box, ART)
        if not artist_ok(aval, parts): continue
        rline, rval = field(box, REL)
        fname = 'released'
        if not rval or not years_in(rval): continue      # only the released field counts (a 'year' field was tried and gave reissue years)
        ys = years_in(rval)
        r = {'kind': kind, 'field': fname, 'line': rline.strip(), 'year': min(ys), 'years': sorted(set(ys))}
        _, recv = field(box, r'(?:recorded|grabación|grabado|gravação|gravado|enregistré|aufnahme|registrazione|записан|kayıt)')
        ry = years_in(recv or '')
        if ry and min(ry) > r['year']: r['contradiction'] = 'infobox recorded %d is after released %d' % (min(ry), r['year'])
        return r
    return None

def album_has_track(wt, title):
    nt = norm(title)
    for m in re.finditer(r'\|\s*title\d+\s*=([^\n]*)', wt):
        if norm(re.sub(r'\{\{.*?\}\}', '', m.group(1))) == nt: return True
    for m in re.finditer(r'(?m)^#\s*(.*)$', wt):
        if title_in_line(m.group(1), title) or norm(re.sub(r'\s*[-–—(].*$', '', m.group(1))) == nt: return True
    return False

def base_title_ok(ftitle, wt, title):
    nt = norm(title)
    if norm(re.sub(r'\s*\([^)]*\)\s*$', '', ftitle)) == nt: return True
    m = re.search(r'\|\s*(?:name|nombre|nome|nom|titre|titel|название|ad|başlık)\s*=([^\n]*)', wt, re.I)
    return bool(m and norm(m.group(1)) == nt)

SEARCH_FAILS = [0]
def search(lang, q):
    if SEARCH_FAILS[0] >= 5 or os.environ.get('H20_NOSEARCH'): return []          # the search service keeps refusing: stop asking, report it
    p = os.path.join(CACHE, hashlib.sha256(f'S|{lang}|{q}'.encode()).hexdigest()[:24] + '.json')
    if os.path.exists(p): return json.load(open(p))
    qs = urllib.parse.urlencode({'action': 'query', 'format': 'json', 'list': 'search', 'srsearch': q, 'srlimit': 3, 'srnamespace': 0})
    for attempt in range(4):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(f'https://{lang}.wikipedia.org/w/api.php?' + qs, headers={'User-Agent': UA}), timeout=30)); break
        except Exception as e:
            print('search retry', lang, e, file=sys.stderr); time.sleep(5 + 5 * attempt)
    else:
        SEARCH_FAILS[0] += 1
        return []
    SEARCH_FAILS[0] = 0
    r = [x['title'] for x in d.get('query', {}).get('search', [])]
    json.dump(r, open(p, 'w')); time.sleep(2.0)
    return r

# ---------- discography tables ----------
def plain(line):
    line = re.sub(r'\{\{\s*(?:nihongo|lang|transl|nowrap|small)[^|{}]*\|([^|{}]*)(?:\|[^{}]*)?\}\}', r'\1', line, flags=re.I)
    line = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', r'\1', line)
    return line.replace("''", '')

def title_in_line(line, title):
    nt = norm(title)
    if not nt: return False
    line = plain(line)
    for q in re.findall(r'"(.*?)"', line) + re.findall(r'«(.*?)»', line) + re.findall(r'„(.*?)“', line):
        if norm(q) == nt: return True
    return False

def from_discography(wt, title):
    """Find the table row that names the song in quotes and the year cell that covers it.
    Returns the contiguous raw text from the year cell to the title (the quote) and the year."""
    hits = []
    for tm in re.finditer(r'(?s)\{\|.*?\n\|\}', wt):
        table = wt[tm.start():tm.end()]
        rows = re.split(r'\n\|-[^\n]*', table)
        offs, pos = [], tm.start()
        for r in rows:
            i = wt.find(r, pos); offs.append(i); pos = i + len(r)
        active = None   # (year, rows left, cell start offset)
        for ri, r in enumerate(rows):
            lines = r.split('\n')
            ycell = None
            for ln in lines:
                m = re.match(r'^\s*[|!]\s*(?:(?:[a-z]+\s*=\s*"?[^|"]*"?\s*)+\|)?\s*((?:1[89]|20)\d\d)\s*(?:<ref.*)?$', ln, re.I)
                if m and ycell is None:
                    rs = re.search(r'rowspan\s*=\s*"?(\d+)', ln, re.I)
                    st = wt.find(ln, offs[ri])
                    ycell = (int(m.group(1)), int(rs.group(1)) if rs else 1, st, st + len(ln))
                    break
            if ycell: active = [ycell[0], ycell[1], ycell[2], ycell[3]]
            for ln in lines:
                if title_in_line(ln, title) and active:
                    tpos = wt.find(ln, offs[ri])
                    q = wt[min(active[2], tpos):max(active[3], tpos + len(ln))]
                    hits.append({'year': active[0], 'quote': q.strip(), 'span': len(q)})
                    break
            if active:
                active[1] -= 1
                if active[1] <= 0: active = None
    if not hits: return None
    ys = sorted({h['year'] for h in hits})
    best = min(hits, key=lambda h: (h['year'], h['span']))
    best['years'] = ys
    return best

def main():
    songs = json.load(open(sys.argv[1]))
    countries = {c['id']: c for c in json.load(open(os.path.join(ROOT, 'data', 'countries.json')))}
    langs_of = {}
    for cc in os.listdir(os.path.join(ROOT, 'data', 'links', 'c')):
        for f in os.listdir(os.path.join(ROOT, 'data', 'links', 'c', cc)):
            for l in json.load(open(os.path.join(ROOT, 'data', 'links', 'c', cc, f))):
                langs_of.setdefault(l['song'], set()).update({'nb': 'no'}.get(x.split('-')[0], x.split('-')[0]) for x in (countries.get(cc, {}).get('langs') or []))
    LANG = ['en']
    gc = {g['id']: (g.get('origin') or {}).get('country') for g in json.load(open(os.path.join(ROOT, 'data', 'genres.json')))}
    for f in os.listdir(os.path.join(ROOT, 'data', 'links', 'g')):
        cc = gc.get(f[:-5])
        for l in json.load(open(os.path.join(ROOT, 'data', 'links', 'g', f))):
            if 'song' in l and cc:
                langs_of.setdefault(l['song'], set()).update({'nb': 'no'}.get(x.split('-')[0], x.split('-')[0]) for x in (countries.get(cc, {}).get('langs') or []))
    res = {s['song']: {'song': s['song'], 'title': s['title'], 'artist': s['artist'], 'year_on_site': s['year_on_site']} for s in songs}

    def song_titles(s):
        out = []
        a = s['artist']; prim = SPLIT.split(a)[0].strip()
        suf = {'en': ['({a} song)', '({p} song)', '(song)'],
               'es': ['(canción de {a})', '(canción de {p})', '(canción)', '(sencillo)'],
               'pt': ['(canção de {a})', '(canção de {p})', '(canção)', '(single)'],
               'fr': ['(chanson de {a})', '(chanson de {p})', '(chanson)', '(single)'],
               'it': ['({a})', '({p})', '(singolo)', '(brano musicale)'],
               'de': ['(Lied)', '({a}-Lied)', '(Song)', '({a}-Song)'],
               'nl': ['({a})', '(lied)', '(single)', '(nummer)'],
               'sv': ['(sång)', '({a})', '(låt)'], 'no': ['(sang)', '({a})'], 'da': ['(sang)', '({a})'], 'fi': ['(kappale)', '({a})'],
               'tr': ['(şarkı)', '({a} şarkısı)', '(albüm)'], 'ru': ['(песня)', '(песня {a})', '(сингл)'],
               'pl': ['(piosenka)', '(singel)'], 'ja': ['({a}の曲)', '(曲)', '(シングル)']}.get(LANG[0], [])
        names = [a, prim] + ([' and '.join(SPLIT.split(a)[:2])] if len(SPLIT.split(a)) > 1 else [])
        tv = []
        for t in title_variants(s['title']):
            for u in (t, t[:1] + t[1:].lower(), t.title()):
                if u not in tv: tv.append(u)
        for t in tv:
            for x in [f'{t} ' + z.format(a=n, p=prim) for z in suf for n in names] + [t]:
                if x not in out: out.append(x)
        return out

    # 1. song articles, English
    searched = {}
    def song_pass(lang, todo, use_search=False):
        LANG[0] = lang
        want = {s['song']: song_titles(s) for s in todo}
        if use_search:
            for s in todo:
                prim = SPLIT.split(s['artist'])[0].strip()
                r = search(lang, f'"{s["title"]}" {prim}')
                searched[s['song']] = r
                want[s['song']] = want[s['song']] + [x for x in r if x not in want[s['song']]]
        allt = sorted({t for v in want.values() for t in v if not re.search(r'[#<>\[\]{}|]', t)})
        got = api(lang, allt)
        for s in todo:
            parts = artist_parts(s['artist'])
            for t in want[s['song']]:
                g = got.get(t)
                if not g: continue
                ftitle, wt, redirected = g
                r = from_song_page(wt, parts, s['title'])
                if not r: continue
                if r['kind'] == 'album':
                    if not album_has_track(wt, s['title']) and not base_title_ok(ftitle, wt, s['title']): continue
                    basis = 'album article'
                elif t in searched.get(s['song'], ()) and not base_title_ok(ftitle, wt, s['title']): continue
                else: basis = 'song article'
                if r.get('contradiction'): res[s['song']]['contradiction'] = r['contradiction']
                res[s['song']].update({'basis': basis, 'field': r['field'], 'lang': lang, 'page': ftitle, 'year': r['year'], 'years': r['years'], 'line': r['line'], 'asked': t})
                break
    song_pass('en', songs)
    print('after en songs', sum(1 for v in res.values() if 'year' in v), file=sys.stderr)

    # 2. discography article, English
    todo = [s for s in songs if 'year' not in res[s['song']]]
    def disc_titles(s):
        a = s['artist']; prim = SPLIT.split(a)[0].strip()
        out = []
        for x in (f'{a} discography', f'{prim} discography', f'{a} singles discography', f'{prim} singles discography'):
            if x not in out: out.append(x)
        return out
    allt = sorted({t for s in todo for t in disc_titles(s) if not re.search(r'[#<>\[\]{}|]', t)})
    got = api('en', allt)
    for s in todo:
        for t in disc_titles(s):
            g = got.get(t)
            if not g: continue
            ftitle, wt, redirected = g
            if 'discography' not in ftitle.lower(): continue      # a redirect to the artist page is read below only as the discography section
            r = from_discography(wt, s['title'])
            if r and r['span'] <= 1500:
                res[s['song']].update({'basis': 'discography', 'lang': 'en', 'page': ftitle, 'year': r['year'], 'years': r['years'], 'line': r['quote'], 'asked': t})
                break
    print('after en discographies', sum(1 for v in res.values() if 'year' in v), file=sys.stderr)

    # 3. song articles in the languages of the countries whose lists hold the song
    todo = [s for s in songs if 'year' not in res[s['song']]]
    bylang = {}
    for s in todo:
        for lg in sorted(langs_of.get(s['song'], set()) - {'en'}):
            bylang.setdefault(lg, []).append(s)
    for lg, ss in sorted(bylang.items()):
        ss = [s for s in ss if 'year' not in res[s['song']]]
        if ss: song_pass(lg, ss)
    for lg in ['en'] + sorted({l for s in songs for l in langs_of.get(s['song'], ())} - {'en'}):
        ss = [s for s in songs if 'year' not in res[s['song']] and (lg == 'en' or lg in langs_of.get(s['song'], ()))]
        if ss: song_pass(lg, ss, use_search=True)
        print('search', lg, sum(1 for v in res.values() if 'year' in v), file=sys.stderr)
    print('after other languages', sum(1 for v in res.values() if 'year' in v), file=sys.stderr)
    print('search gave up' if SEARCH_FAILS[0] >= 5 else 'search ran', file=sys.stderr)
    for s in songs:
        res[s['song']]['langs_tried'] = ['en'] + sorted(langs_of.get(s['song'], set()) - {'en'})
    json.dump([res[s['song']] for s in songs], open(sys.argv[2], 'w'), ensure_ascii=False, indent=0)

if __name__ == '__main__':
    main()
