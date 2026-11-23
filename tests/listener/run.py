#!/usr/bin/env python3
"""Synthetic listener tests: prepare a run, record its results, write the coverage table.
See tests/listener/README.md. Usage:
  run.py prepare <brief> <version> --place ISO --years Y1,Y2[,..] [--mode heard|home]
  run.py record <run folder> --model <model id> [--apply]
  run.py coverage
"""
import argparse, datetime, glob, hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
MODELS = {('place-time', 1): 'claude-opus-5-5'}   # the registered model per brief version (tests/listener/README.md)
BAR = 8                                           # every tested year must score at least this

def sha(b): return hashlib.sha256(b).hexdigest()[:16]
def data_print():
    h = hashlib.sha256()
    for f in sorted(os.listdir(os.path.join(ROOT, 'data'))):
        h.update(f.encode()); h.update(open(os.path.join(ROOT, 'data', f), 'rb').read())
    return h.hexdigest()[:16]
def commit(): return subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], cwd=ROOT, capture_output=True, text=True).stdout.strip()
def dirty(): return bool(subprocess.run(['git', 'status', '--porcelain', 'data', 'src'], cwd=ROOT, capture_output=True, text=True).stdout.strip())
def load(name): return json.load(open(os.path.join(ROOT, 'data', name + '.json'), encoding='utf-8'))

def prepare(a):
    brief = os.path.join(HERE, 'briefs', '%s.v%d.md' % (a.brief, a.version))
    if not os.path.exists(brief): sys.exit('No such brief: ' + brief)
    if (a.brief, a.version) not in MODELS: sys.exit('This brief version has no registered model.')
    years = [int(y) for y in a.years.split(',')]
    subprocess.run([sys.executable, os.path.join(ROOT, 'build.py')], check=True, capture_output=True)
    from playwright.sync_api import sync_playwright
    cases = []
    with sync_playwright() as pw:
        b = pw.chromium.launch(); p = b.new_page()
        p.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
        p.goto('file://' + os.path.join(ROOT, 'dist', 'index.html'), wait_until='domcontentloaded'); p.wait_for_timeout(800)
        for y in years:
            c = p.evaluate("""([iso,y,mode])=>{ resetFilters('all'); setYear(y); setStay(0); setPlace({k:'cty',iso}); PMODE=mode; PLANG='en';
                const pr=stPrompt(); return {place:placeName(), when:stWhen(), era:String(pr.era), seeds:(pr.seeds||[]).length, prompt:pr.txt}; }""", [a.place, y, a.mode])
            cases.append(dict(id='%s%d' % (a.place, y), place=c['place'], iso=a.place, year=y, when=c['when'], mode=a.mode, seedSource=c['era'], seeds=c['seeds'], prompt=c['prompt']))
        b.close()
    name = '%s-%s-v%d-%s-%d-%d' % (datetime.date.today().isoformat(), a.brief, a.version, a.place, min(years), max(years))
    run = os.path.join(HERE, 'runs', name); os.makedirs(run, exist_ok=False)
    json.dump(cases, open(os.path.join(run, 'cases.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    man = dict(run=name, brief=a.brief, version=a.version, brief_print=sha(open(brief, 'rb').read()), data_commit=commit(), data_uncommitted=dirty(),
               data_print=data_print(), cases_print=sha(open(os.path.join(run, 'cases.json'), 'rb').read()), place=a.place, years=years, mode=a.mode,
               model_required=MODELS[(a.brief, a.version)], prepared=datetime.date.today().isoformat(), status='prepared')
    json.dump(man, open(os.path.join(run, 'manifest.json'), 'w'), indent=1)
    rel = os.path.relpath(run, ROOT)
    open(os.path.join(run, 'INSTRUCTIONS.md'), 'w').write(
        '# Listener run %s\n\nRun this on model `%s` and no other. Use a fresh agent that has not seen the research behind these lists.\n\n'
        '1. Read the brief: `tests/listener/briefs/%s.v%d.md`. Follow it exactly.\n2. Your case file is `%s/cases.json`. There is one variant per case; ignore the brief\'s mention of comparing A and B.\n'
        '3. Write your results to `%s/results.json` in the shape the brief gives, keyed by case id.\n4. Change no other file.\n' % (name, man['model_required'], a.brief, a.version, rel, rel))
    print('prepared', rel, 'cases:', len(cases))

def record(a):
    run = os.path.abspath(a.run); man = json.load(open(os.path.join(run, 'manifest.json')))
    if a.model != man['model_required']: sys.exit('This brief version is registered for %s, not %s.' % (man['model_required'], a.model))
    cases = json.load(open(os.path.join(run, 'cases.json'), encoding='utf-8'))
    if sha(open(os.path.join(run, 'cases.json'), 'rb').read()) != man['cases_print']: sys.exit('cases.json was changed after the run was prepared.')
    res = json.load(open(os.path.join(run, 'results.json'), encoding='utf-8')); scores = []
    for c in cases:
        r = res.get(c['id']); s = r.get('score') if isinstance(r, dict) else None
        if not isinstance(s, int) or not 1 <= s <= 10: sys.exit('No valid score for case ' + c['id'])
        scores.append(s)
    result = 'pass' if min(scores) >= BAR else 'below'
    man.update(status='recorded', model=a.model, recorded=datetime.date.today().isoformat(), scores=scores, result=result)
    json.dump(man, open(os.path.join(run, 'manifest.json'), 'w'), indent=1)
    line = dict(iso=man['place'], y0=min(man['years']) // 10 * 10, y1=min(man['years']) // 10 * 10 + 9, date=man['recorded'], scores=scores, result=result, note='', run=man['run'])
    text = json.dumps(line, ensure_ascii=False, separators=(',', ':'))
    if a.apply:
        p = os.path.join(ROOT, 'data', 'tests.json'); s = open(p, encoding='utf-8').read().rstrip()
        assert s.endswith(']'); open(p, 'w', encoding='utf-8').write(s[:-1].rstrip() + ',\n' + text + '\n]\n'); print('added to data/tests.json')
    print(result, scores); print(text)

def coverage(a):
    nodes, defs, pl, era, yearl, iso, tests = (load(k) for k in ('nodes', 'defs', 'playlists', 'era', 'yearl', 'iso', 'tests'))
    runs = [json.load(open(m)) for m in sorted(glob.glob(os.path.join(HERE, 'runs', '*', 'manifest.json')))]
    def tested(i, d):
        out = []
        for t in tests:
            if t.get('iso') == i and t['y0'] <= d + 9 and t['y1'] >= d:
                out.append('%s %s (%s)%s' % (t['result'], ', '.join(map(str, t['scores'])), t['date'], '' if t.get('run') else ', before the registry'))
        for r in runs:
            if r['status'] == 'prepared' and r['place'] == i and any(y // 10 * 10 == d for y in r['years']): out.append('prepared, not yet judged (%s)' % r['run'])
        return '; '.join(out)
    L = ['# Coverage', '', 'Generated by `python3 tests/listener/run.py coverage` from `data/` at commit `%s`. Do not edit by hand.' % commit(), '',
         'Research states. Genre: **full**, **thin** or **none** is the playlist status; **definition only** has no playlist; **pending** has a name and a place on the tree and nothing else. '
         'Country-decade: **year lists** means hits researched year by year with sources; **decade list** is one list for the decade; blank is nothing.', '']
    gs = {}
    for n in nodes:
        st = 'pending' if n[0] not in defs else (pl[n[0]]['status'] if n[0] in pl else 'definition only'); gs.setdefault(st, []).append(n)
    L += ['## Genres', '', '| Research state | Genres |', '| :- | -: |'] + ['| %s | %d |' % (k, len(gs[k])) for k in ('full', 'thin', 'none', 'definition only', 'pending') if k in gs]
    L += ['| **Total** | **%d** |' % len(nodes), '', 'Listener tests of a genre playlist: %d. No brief for genre playlists is registered yet.' % sum(1 for t in tests if t.get('g')), '']
    for k in ('pending', 'thin', 'none', 'definition only'):
        if k in gs: L += ['### %s (%d)' % (k.capitalize(), len(gs[k])), '', ', '.join('%s (`%s`)' % (n[1], n[0]) for n in gs[k]), '']
    L += ['## Countries and decades', '', 'Only countries with any song list are shown: %d of %d. Research by year starts at the 1940s.' % (len(set(era) | set(yearl)), len(iso)), '',
          '| Country | Decade | Research | Listener tests |', '| :- | :- | :- | :- |']
    owed = 0
    for i in sorted(set(era) | set(yearl), key=lambda k: iso.get(k, [k])[0]):
        for d in range(1940, 2030, 10):
            yl = any(int(y) // 10 * 10 == d for y in yearl.get(i, {})); dl = str(d) in era.get(i, {})
            if not (yl or dl): continue
            t = tested(i, d); owed += (yl and not t)
            L.append('| %s | %ds | %s | %s |' % (iso.get(i, [i])[0], d, 'year lists' if yl else 'decade list', t))
    L += ['', 'Year lists that have never been listener-tested: %d.' % owed, '', '## Runs under the registry', '']
    L += (['| Run | Brief | Model | Data commit | Status | Scores |', '| :- | :- | :- | :- | :- | :- |'] + ['| `%s` | %s v%d | %s | `%s` | %s | %s |' % (r['run'], r['brief'], r['version'], r.get('model', r['model_required'] + ' (required)'), r['data_commit'], r['status'], ', '.join(map(str, r.get('scores', [])))) for r in runs]) if runs else ['None yet.']
    open(os.path.join(ROOT, 'docs', 'COVERAGE.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n'); print('docs/COVERAGE.md written')

ap = argparse.ArgumentParser(); sub = ap.add_subparsers(dest='cmd', required=True)
p = sub.add_parser('prepare'); p.add_argument('brief'); p.add_argument('version', type=int); p.add_argument('--place', required=True); p.add_argument('--years', required=True); p.add_argument('--mode', default='heard', choices=['heard', 'home']); p.set_defaults(f=prepare)
p = sub.add_parser('record'); p.add_argument('run'); p.add_argument('--model', required=True); p.add_argument('--apply', action='store_true'); p.set_defaults(f=record)
p = sub.add_parser('coverage'); p.set_defaults(f=coverage)
a = ap.parse_args(); a.f(a)
