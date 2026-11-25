"""H21: year of first release for the songs in work/2026-11-24-years/songs.2.json, from Wikipedia raw text.

Order per song (decision D18), stopping at the first that answers:
  1. the song's own article: the infobox whose artist matches our credit; its release-date field
  2. the artist's discography: a discography article, else the artist's own article; the table row naming the song
  3. the album article (only reached when a song title redirects to an album article that lists the song)
English first, then the languages of the countries the song is listed under (and its genre's origin country).
Search and the title lookup only FIND pages. The quote is always cut from the raw article text, and is checked
with tools/check_evidence.py's own normalising before it is kept.
  python3 years.py            -> ../results.raw.json
"""
import json, os, re, sys, unicodedata, html
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(REPO, 'tools'))
import wiki
from check_evidence import norm as cnorm, text_of

TODAY = '2026-11-24'
YR = re.compile(r'(?<!\d)(18[89]\d|19\d\d|20[0-2]\d)(?!\d)')

def n(s):
    s = unicodedata.normalize('NFKD', s or '')
    s = ''.join(c for c in s if not unicodedata.combining(c)).casefold()
    s = s.replace('&', ' and ')
    return re.sub(r'[^\w]+', ' ', s).strip()

def display(s):
    """visible text of a bit of wikitext"""
    s = re.sub(r'(?is)<ref[^>/]*/>|<ref[^>]*>.*?</ref>|<!--.*?-->', ' ', s)
    s = re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', r'\1', s)
    s = re.sub(r'\{\{(?:[^{}|]*\|)*([^{}|]*)\}\}', r'\1', s)
    s = re.sub(r'<[^>]+>', ' ', s)
    return html.unescape(s).replace("''", '')

SPLIT = re.compile(r'\s+(?:feat\.?|featuring|ft\.?|with|and|&|x|y|et|e|und|con|vs\.?)\s+|\s*[,/+]\s*', re.I)
def parts(credit):
    return [p for p in (n(x) for x in SPLIT.split(credit)) if len(p) >= 2]

def artist_ok(field, credit):
    f = n(display(field)); c = n(credit)
    if not f: return False
    if c and (c in f or (len(f) >= 4 and f in c)): return True
    ps = parts(credit)
    return bool(ps) and len(ps[0]) >= 3 and (ps[0] in f or (len(f) >= 4 and f in ps[0]))

def base(title):
    return n(re.sub(r'\s*\([^)]*\)\s*$', '', title))

def title_ok(page_title, song_title):
    a, b = base(page_title), n(re.sub(r'\s*\([^)]*\)\s*$', '', song_title))
    return a == b or a == n(song_title)

# ---------- templates ----------
def templates(text):
    """(start, end, name, [(key, value, seg_start, seg_end)]) for each top-level-ish template"""
    out = []; i = 0
    while True:
        i = text.find('{{', i)
        if i < 0: break
        depth = 0; j = i
        while j < len(text) - 1:
            if text.startswith('{{', j): depth += 1; j += 2; continue
            if text.startswith('}}', j):
                depth -= 1; j += 2
                if depth == 0: break
                continue
            j += 1
        body = text[i + 2:j - 2]
        # split on top-level pipes
        segs, d, sq, k, last = [], 0, 0, 0, 0
        while k < len(body):
            if body.startswith('{{', k): d += 1; k += 2; continue
            if body.startswith('}}', k): d -= 1; k += 2; continue
            if body.startswith('[[', k): sq += 1; k += 2; continue
            if body.startswith(']]', k): sq -= 1; k += 2; continue
            if body[k] == '|' and d == 0 and sq == 0: segs.append((last, k)); last = k + 1
            k += 1
        segs.append((last, len(body)))
        name = body[segs[0][0]:segs[0][1]].strip()
        params = []
        for a, b in segs[1:]:
            seg = body[a:b]
            if '=' in seg:
                key, val = seg.split('=', 1)
                params.append((key.strip(), val, i + 2 + a, i + 2 + b))
        if len(params) >= 3: out.append((i, j, name, params))
        i += 2
    return out

ARTIST = {'artist', 'artists', 'artiste', 'artistes', 'interprète', 'interprete', 'interpretes', 'artista', 'artistas', 'künstler', 'interpret',
          'artiest', 'esittäjä', 'sanatçı', 'исполнитель', 'виконавець', '아티스트', '가수', 'アーティスト', '歌手', '艺人', '藝人', '演唱者', '演唱',
          'artis', 'penyanyi', 'الفنان', 'فنان', 'المغني', 'خواننده', 'هنرمند', 'singer', 'performer', 'izvođač', 'izvodjač', 'изпълнител',
          'wykonawca', 'umělec', 'interpret', 'előadó', 'καλλιτέχνης', 'ศิลปิน', 'nghệ sĩ', 'ca sĩ', 'band', 'גרופה', 'אמן', 'מבצע', 'kunstner',
          'artiste principal', 'artistă', 'artist principal', 'музикант', 'музыкант', 'изпълнители', 'interprète principal', 'izvajalec', 'izvršilac'}
DATE = {'released', 'release date', 'release', 'releasedate', 'published', 'first released', 'sorti', 'sortie', 'date de sortie', 'publicación',
        'publicado', 'lanzado', 'lanzamiento', 'fecha', 'fecha de lanzamiento', 'lançado', 'lançamento', 'publicação', 'data de lançamento',
        'anno', 'pubblicazione', 'data', 'veröffentlichung', 'erschienen', 'veröffentlicht', 'julkaistu', 'julkaisu', 'utgiven', 'utgivelse',
        'utgitt', 'udgivet', 'udgivelse', 'uitgebracht', 'uitgave', 'datum', 'yayımlanma', 'yayınlanma', 'yayımlanma tarihi', 'çıkış tarihi', 'rilis', 'dirilis',
        'tanggal rilis', '発売日', '発売', '发行日期', '發行日期', '发行', '發行', '发行时间', '發行時間', '발매일', '발매', 'выпущен', 'вышел',
        'выпуск', 'дата выпуска', 'випущений', 'дата', 'izdan', 'objavljen', 'wydany', 'data wydania', 'vydáno', 'vydán', 'megjelent',
        'megjelenés', 'κυκλοφορία', 'תאריך הוצאה', 'יצא', 'ออกจำหน่าย', 'phát hành', 'publicat', 'lansat', 'lansare', 'تاريخ الإصدار', 'صدر',
        'الإصدار', 'تاریخ انتشار', 'انتشار', 'utgivning', 'izdano', 'издаден', 'издан', 'дата на издаване'}
LATE = {'published', 'data', 'datum', 'date', 'fecha', 'дата', 'anno'}   # read after the fields that name a release
def keynorm(k): return re.sub(r'\s+', ' ', k.replace('_', ' ')).strip().casefold()

def infoboxes(text):
    out = []
    for s, e, name, params in templates(text):
        ks = {keynorm(k): (k, v, a, b) for k, v, a, b in params}
        art = [ks[k] for k in ks if k in ARTIST or 'artist' in k]
        dat = sorted((ks[k] for k in ks if k in DATE), key=lambda p: keynorm(p[0]) in LATE)
        if art and dat: out.append((name, art, dat, ks))
    return out

def clean_quote(text, a, b, year):
    """the raw text of a key=value segment, ending just after the year; None if a tag or entity sits inside it"""
    seg = text[a:b]
    m = next((m for m in YR.finditer(seg) if m.group(1) == str(year)), None)
    if not m: return None
    q = seg[:m.end()].strip().lstrip('|').strip()
    if '<' in q or '&' in q: return None
    # finish the template or link the year sits in, when it closes on the same line
    rest = seg[m.end():].split('\n')[0]
    for close, opn in (('}}', '{{'), (']]', '[[')):
        if q.count(opn) > q.count(close):
            k = rest.find(close)
            if 0 <= k < 40 and '<' not in rest[:k] and '&' not in rest[:k] and opn not in rest[:k]:
                q += rest[:k + 2]; rest = rest[k + 2:]
    return q

def checked(page_text, quote):
    return quote and cnorm(quote) in cnorm(text_of(page_text))

def earliest(val):
    v = re.sub(r'(?is)<ref[^>/]*/>|<ref[^>]*>.*?</ref>|<!--.*?-->', ' ', val)
    ys = [int(y) for y in YR.findall(v)]
    return min(ys) if ys else None

def from_song_article(lang, title, text, song):
    """year from the infobox whose artist matches; basis song article, or album article for an album infobox"""
    for name, art, dat, ks in infoboxes(text):
        if not any(artist_ok(v, song['artist']) for _, v, _, _ in art): continue
        is_album = 'album' in name.casefold() or 'ep' == name.casefold()[-2:]
        for k, v, a, b in dat:
            y = earliest(v)
            if not y: continue
            q = clean_quote(text, a, b, y)
            if not checked(text, q): continue
            return dict(year=y, quote=q, infobox=name, field=k.strip(), album=is_album)
    return None

DIS = {'fr': ['chanson', 'single'], 'es': ['canción', 'sencillo'], 'pt': ['canção', 'single'], 'it': ['singolo', 'brano musicale', 'canzone'],
       'de': ['Lied', 'Song', 'Single'], 'nl': ['single', 'lied', 'nummer'], 'sv': ['sång', 'låt'], 'no': ['sang', 'låt'], 'da': ['sang'],
       'fi': ['kappale', 'laulu'], 'pl': ['singel', 'piosenka'], 'tr': ['şarkı'], 'id': ['lagu'], 'ms': ['lagu'], 'ru': ['песня', 'сингл'],
       'uk': ['пісня'], 'ro': ['cântec'], 'cs': ['píseň'], 'hu': ['dal'], 'el': ['τραγούδι'], 'hr': ['pjesma'], 'sr': ['песма'],
       'ja': ['曲'], 'ko': ['노래'], 'zh': ['歌曲'], 'vi': ['bài hát'], 'th': ['เพลง'], 'tl': ['awit'], 'he': ['שיר'], 'ar': ['أغنية'], 'fa': ['ترانه']}
def song_candidates(lang, song):
    T, A = song['title'], song['artist']
    first = SPLIT.split(A)[0].strip()
    if lang == 'en':
        return [f'{T} ({A} song)', f'{T} ({first} song)', f'{T} (song)', f'{T} (single)', T]
    dis = DIS.get(lang, [])
    return [f'{T} ({A})', f'{T} ({first})'] + [f'{T} ({d})' for d in dis] + [f'{T} ({d} {x})' for d in dis[:1] for x in (A, first)] + [T]

def pages_lazily(lang, cands, limit):
    seen = []
    for c in cands:
        f = wiki.resolve(lang, [c]).get(c)
        if f and f not in seen:
            seen.append(f); yield f
            if len(seen) >= limit: return

def try_song(lang, song, pre=None):
    tried = []
    for t in pages_lazily(lang, song_candidates(lang, song), 4):
        text = wiki.raw(lang, t); tried.append(t)
        if not text: continue
        r = from_song_article(lang, t, text, song)
        if not r: continue
        if r['album'] and title_ok(t, song['title']):
            continue   # an album of the same name may be later than the song (a compilation named after it): not used
        if r['album']:
            # a song title that leads to an album article: the album counts only if its text names the song
            line = next((l for l in text.split('\n') if n(song['title']) and n(song['title']) in n(display(l)) and '<' not in l and '&' not in l), None)
            if not line or not checked(text, line.strip()): continue
            r.update(basis='album article', quote2=line.strip())
        elif title_ok(t, song['title']):
            r['basis'] = 'song article'
        else:
            continue
        r.update(lang=lang, page=t, url=wiki.raw_url(lang, t))
        return r, tried
    return None, tried

# ---------- discography tables ----------
YEARCELL = re.compile(r"^\s*(?:[^|\n]*=[^|\n]*\|)?\s*'*\s*(18[89]\d|19\d\d|20[0-2]\d)\s*'*\s*$")
def rows_of(text):
    """yield (row cells) for each table row: cells are (start, end, raw)"""
    for tm in re.finditer(r'(?ms)^\{\|.*?^\|\}', text):
        t0 = tm.start(); tab = tm.group(0)
        for rm in re.finditer(r'(?ms)(?:^\|-[^\n]*\n|\A\{\|[^\n]*\n)(.*?)(?=^\|-|^\|\})', tab):
            cells = []; r0 = t0 + rm.start(1)
            pos = 0; body = rm.group(1)
            for line in body.split('\n'):
                ls = pos; pos += len(line) + 1
                if not line or line[0] not in '|!' or line.startswith('|+'):
                    if cells and line and not line.startswith('|+'):   # continuation of the last cell
                        s, e, _ = cells[-1]; cells[-1] = (s, r0 + ls + len(line), text[s:r0 + ls + len(line)])
                    continue
                sep = '||' if line[0] == '|' else '!!'
                off = 1; inner = line[1:]
                for piece in re.split(r'\|\||!!', inner):
                    s = r0 + ls + off; e = s + len(piece)
                    cells.append((s, e, text[s:e])); off += len(piece) + 2
            yield cells

def rowspan(cell):
    m = re.search(r'rowspan\s*=\s*"?(\d+)', cell.split('|')[0] if '|' in cell else '')
    return int(m.group(1)) if m else 1

def cell_value(cell):
    # drop attributes (text before a single pipe that holds an '=')
    m = re.match(r'^([^|\[\]{}]*=[^|\[\]{}]*)\|(?!\|)(.*)$', cell, re.S)
    return m.group(2) if m else cell

def title_cell(cell, song_title):
    if cell_value(cell).strip().startswith("''"): return False   # a title in italics is an album, not the song
    v = display(cell_value(cell)).strip()
    v = re.sub(r'^[\s"“”\'«»„]+|[\s"“”\'«»„]+$', '', v)
    a = n(v); b = n(song_title); b2 = b   # the full title: '(Main Title)' cut off matched a film's name
    if not a or not b: return False
    if a in (b, b2): return True
    # "Title" (featuring X) / "Title" / "Other"
    first = n(re.split(r'["“”«»]|\(|\n|<br', display(cell_value(cell)).strip().strip('"“”«»„ '))[0])
    return first in (b, b2)

def from_table(text, song):
    year = None; left = 0; ycell = None; hits = []
    for cells in rows_of(text):
        found_y = None
        for c in cells:
            m = YEARCELL.match(cell_value(c[2]))
            if m and ('rowspan' in c[2] or True):
                found_y = (int(m.group(1)), c, rowspan(c[2])); break
        if found_y:
            year, ycell, left = found_y[0], found_y[1], found_y[2]
        elif left <= 0:
            year, ycell = None, None
        others = [c for c in cells if c is not ycell]
        for c in others[:1]:   # the song must be the row's first cell: a title further along is a track of an album row
            if year and title_cell(c[2], song['title']):
                a = min(c[0], ycell[0]); b = max(c[1], ycell[1])
                q = text[a:b].strip()
                if 0 < len(q) <= 1500 and '<' not in q and '&' not in q and checked(text, q):
                    hits.append(dict(year=year, quote=q))
                break
        left -= 1
    return min(hits, key=lambda h: h['year']) if hits else None   # the earliest row: later ones are reissues

DISCO = {'en': ['{A} discography', '{A} singles discography'], 'de': ['{A}/Diskografie', 'Diskografie von {A}'],
         'fr': ['Discographie de {A}'], 'es': ['Anexo:Discografía de {A}', 'Discografía de {A}'], 'pt': ['Discografia de {A}'],
         'it': ['Discografia di {A}', 'Discografia dei {A}'], 'nl': ['Discografie van {A}'], 'sv': ['{A}s diskografi', '{A} diskografi'],
         'pl': ['Dyskografia {A}'], 'fi': ['{A} diskografia'], 'tr': ['{A} diskografisi']}

def try_disco(lang, song, artist_pages):
    A = song['artist']; first = SPLIT.split(A)[0].strip()
    names = list(dict.fromkeys([A, first]))
    cands = [p.format(A=x) for p in DISCO.get(lang, []) for x in names] + names
    tried = []
    for t in pages_lazily(lang, cands, 3):
        text = wiki.raw(lang, t); tried.append(t)
        if not text: continue
        # the artist's own article must be about this artist: its lead or infobox names them
        r = from_table(text, song)
        if r:
            r.update(basis='discography', lang=lang, page=t, url=wiki.raw_url(lang, t))
            return r, tried
    return None, tried

WLANG = {'pt-PT': 'pt', 'pt-BR': 'pt', 'zh-Hant': 'zh', 'zh-Hans': 'zh', 'nb': 'no'}

def langs_for(songs):
    countries = {c['id']: c for c in json.load(open(os.path.join(REPO, 'data/countries.json'), encoding='utf-8'))}
    genres = {}
    for l in open(os.path.join(REPO, 'data/genres.json'), encoding='utf-8'):
        l = l.strip().rstrip(',')
        if l.startswith('{'):
            g = json.loads(l); genres[g['id']] = g
    want = {s['song'] for s in songs}; cc = {s: set() for s in want}
    for root, _, files in os.walk(os.path.join(REPO, 'data/links')):
        for f in files:
            for l in open(os.path.join(root, f), encoding='utf-8'):
                l = l.strip().rstrip(',')
                if not l.startswith('{'): continue
                r = json.loads(l)
                if r.get('song') not in want: continue
                sc = r['scope'].split(':')
                if sc[0] == 'c': cc[r['song']].add(sc[1])
                elif sc[0] == 'g' and sc[1] in genres:
                    o = (genres[sc[1]].get('origin') or {}).get('country')
                    if o: cc[r['song']].add(o)
    out = {}
    for s, cs in cc.items():
        ls = []
        for c in sorted(cs):
            for l in countries.get(c, {}).get('langs', []):
                l = WLANG.get(l, l)
                if l != 'en' and l not in ls: ls.append(l)
        out[s] = (sorted(cs), ls)
    return out

def main():
    songs = json.load(open(os.path.join(REPO, 'work/2026-11-24-years/songs.2.json'), encoding='utf-8'))
    lim = int(sys.argv[1]) if len(sys.argv) > 1 else len(songs)
    songs = songs[:lim]
    ctx = langs_for(songs)
    outp = os.path.join(HERE, '..', 'results.raw.json')
    done = {}
    if os.path.exists(outp): done = {r['song']: r for r in json.load(open(outp, encoding='utf-8'))}
    # batch title lookups in English
    pre = None
    results = []
    for i, s in enumerate(songs):
        if s['song'] in done: results.append(done[s['song']]); continue
        countries, langs = ctx.get(s['song'], ([], []))
        rec = dict(song=s['song'], title=s['title'], artist=s['artist'], year_on_site=s['year_on_site'], countries=countries, langs=['en'] + langs, tried=[])
        hit = None
        for lang in ['en'] + langs[:2]:
            hit, tr = try_song(lang, s, pre if lang == 'en' else None); rec['tried'] += [lang + ':' + t for t in tr]
            if hit: break
        if not hit:
            for lang in ['en'] + langs[:2]:
                hit, tr = try_disco(lang, s, None); rec['tried'] += [lang + ':' + t for t in tr]
                if hit: break
        if hit: rec.update(hit)
        results.append(rec)
        if i % 25 == 0:
            json.dump(results, open(outp, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
            print(i, sum(1 for r in results if 'year' in r), flush=True)
    json.dump(results, open(outp, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('done', len(results), sum(1 for r in results if 'year' in r))

if __name__ == '__main__':
    main()
