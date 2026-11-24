#!/usr/bin/env python3
"""Shareable links: the address carries the view, place, time, genre and open playlist, and opens the app there.

Needs Python Playwright with Chromium. Run after build.py: python3 tests/links.py [folder for screenshots]
"""
import os, sys
from playwright.sync_api import sync_playwright

PAGE = 'file://' + os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist', 'index.html'))
SHOTS = sys.argv[1] if len(sys.argv) > 1 else None
PHONE, DESK = {'width': 400, 'height': 800}, {'width': 1280, 'height': 800}

# Everything the address is meant to carry, read from the page itself.
STATE = """(()=>{ const p=document.getElementById('stpanel');
  return {place:PLKEY(STP), year:STY, from:STFROM===T0?'until':STFROM, span:STFROM==null?STSPAN:null, genre:GKEY(FG),
    ftm:FTM, fpl:FPL, pmode:PMODE, view:curView(), gp:GP, panel:!p.hidden, mode:p.dataset.mode||null}; })()"""

def open_page(pw, viewport, query='', dark=False, clipboard=False):
    errors = []
    browser = pw.chromium.launch()
    ctx = browser.new_context(viewport=viewport, color_scheme='dark' if dark else 'light')
    if clipboard:
        ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
    page = ctx.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    # Other sites (fonts, map outlines, cover art, the database) are not part of this test.
    page.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
    page.goto(PAGE + query, wait_until='domcontentloaded')
    page.wait_for_timeout(900)
    return browser, page, errors

def shot(page, name):
    if SHOTS: page.screenshot(path=os.path.join(SHOTS, name + '.png'))

def no_sideways(page):
    assert not page.evaluate('document.documentElement.scrollWidth > innerWidth'), 'page scrolls sideways'

with sync_playwright() as pw:
    # (a) a place-and-time link opens the map, Japan, 1985, just that year, with the playlist panel open
    b, p, errs = open_page(pw, PHONE, '?v=map&p=cty:JP&y=1985&s=0&pl=1')
    s = p.evaluate(STATE)
    assert s['view'] == 'map' and s['place'] == 'cty:JP' and s['year'] == 1985 and s['from'] is None and s['span'] == 0, s
    assert s['panel'] and s['mode'] == 'moment' and s['gp'] is None, s
    prompt = p.input_value('#stprompt')
    assert 'Japan' in prompt and '1985' in prompt, prompt[:300]
    assert p.is_visible('#sttabs') and p.is_visible('#shareb')
    # the address keeps saying the same thing once the page has settled
    p.wait_for_timeout(700)
    q = p.evaluate('location.search')
    for part in ('v=map', 'p=cty:JP', 'y=1985', 's=0', 'pl=1'):
        assert part in q, (part, q)
    no_sideways(p); shot(p, 'links-moment-phone-light')
    assert not errs, errs; b.close(); print('ok place and time link')

    # (b) a genre playlist link opens the list with that genre's playlist
    b, p, errs = open_page(pw, PHONE, '?v=list&pl=swing')
    s = p.evaluate(STATE)
    assert s['view'] == 'list' and s['gp'] == 'swing' and s['panel'] and s['mode'] == 'genre', s
    assert p.inner_text('#sthere') == p.evaluate("byId['swing'].name"), p.inner_text('#sthere')
    assert p.is_visible('#sttabs') and not p.is_visible('#sttabs button[data-sttab="sounds"]')   # a genre has no Sounds tab
    no_sideways(p); shot(p, 'links-genre-phone-light')
    assert not errs, errs; b.close(); print('ok genre playlist link')

    # (c) round trips: set a state through the page's own functions, open a new page at its address, compare
    b, p, errs = open_page(pw, DESK)
    city = p.evaluate("CITIES.findIndex(c=>c.iso2==='JP')")
    band = p.evaluate('BANDS[0][0]')
    trad = p.evaluate('Object.keys(TRADM).find(t=>TRADM[t].length>1)')
    spaced = p.evaluate("CITIES.findIndex(c=>/ /.test(c.name)&&/[^\\x00-\\x7f]/.test(c.name))")
    if spaced < 0: spaced = p.evaluate("CITIES.findIndex(c=>/ /.test(c.name))")
    assert spaced >= 0
    b.close()
    SETUPS = [
        ('region, a decade, genre band, map',
         "setPlace({k:'reg',reg:'eur'}); setYear(1965); setStay(5); FG={k:'band',id:%r}; stApply(); applyHighlight(); location.hash='map';" % band),
        ('city, from a year, movement, made here, born then, tunnel, panel open',
         "setPlace({k:'city',i:%d,iso:CITIES[%d].iso2}); setYear(1999); setStay('from',1980); FG={k:'mov',id:'swing'}; FPL='made'; FTM='made'; stApply(); location.hash='tunnel'; setTimeout(()=>{ stPanelOpen=true; stBarUI(); stPanelUpdate(); },100);" % (city, city)),
        ('several places, until a year, several genres, playlist made there',
         "setPlace({k:'multi',items:[{k:'cty',iso:'JP'},{k:'cty',iso:'BR'},{k:'reg',reg:'eur'}]}); setYear(1950); setStay('until'); FG={k:'multi',items:[{k:'trad',id:%r},{k:'mov',id:'swing'}]}; stApply(); setPmode('home');" % trad),
        ('country, a few years, genre playlist in the list',
         "setPlace({k:'cty',iso:'NG'}); setYear(1977); setStay(2); stApply(); location.hash='list'; setTimeout(()=>{ select('swing'); openGenrePlaylist('swing'); },150);"),
        ('city whose name has a space, several places with a city, list without a panel',
         "setPlace({k:'multi',items:[{k:'city',i:%d,iso:CITIES[%d].iso2},{k:'cty',iso:'JP'}]}); setYear(1988); setStay(12); stApply(); location.hash='list';" % (spaced, spaced)),
        ('BCE year, just that year, tree',
         "setYear(-500); setStay(0); stApply();"),
    ]
    for name, js in SETUPS:
        b, p, errs = open_page(pw, DESK)
        p.evaluate(js); p.wait_for_timeout(1000)
        want = p.evaluate(STATE)
        url = p.evaluate('location.href')
        # the address bar says the same as the link the button would copy
        share = p.evaluate('LINKS.url()')
        assert p.evaluate('location.search') == (('?' + share.split('?', 1)[1]) if '?' in share else ''), (url, share)
        assert not errs, (name, errs); b.close()
        b, p, errs = open_page(pw, DESK, '?' + url.split('?', 1)[1].split('#')[0] if '?' in url else '')
        got = p.evaluate(STATE)
        for k in want:
            assert got[k] == want[k], (name, k, want[k], got[k], url)
        assert not errs, (name, errs); b.close()
        print('ok round trip:', name, '->', url.split('?', 1)[-1])

    # dragging the time slider does not rewrite the address on every step
    b, p, errs = open_page(pw, DESK)
    p.evaluate("window.__rs=0; const r0=history.replaceState.bind(history); history.replaceState=(...a)=>{ window.__rs++; return r0(...a); }; 0")
    ms = p.evaluate("(async()=>{ const t0=performance.now(), s=document.getElementById('stslider'); for(let i=0;i<200;i++){ s.value=String(500+i); s.dispatchEvent(new Event('input')); await new Promise(r=>setTimeout(r,5)); } return performance.now()-t0; })()")
    p.wait_for_timeout(1500)
    n = p.evaluate('window.__rs')
    assert 1 <= n <= ms / 500 + 3, (n, ms)   # at most one write per half second while the slider moves
    assert ('y=%d' % p.evaluate('STY')) in p.evaluate('location.search'), p.evaluate('location.search')
    assert not errs, errs; b.close(); print('ok slider drag: 200 steps in %d ms, %d address updates' % (ms, n))

    # (d) garbage opens the default state without a script error
    b, p, errs = open_page(pw, PHONE, '?p=zzz&y=abc&g=&pl=nope&v=nowhere&s=from:x&tm=1&m=zz')
    s = p.evaluate(STATE)
    assert s == {'place': None, 'year': 2026, 'from': 'until', 'span': None, 'genre': None, 'ftm': 'heard', 'fpl': 'heard',
                 'pmode': 'heard', 'view': 'tree', 'gp': None, 'panel': False, 'mode': s['mode']}, s
    p.wait_for_timeout(700)
    assert p.evaluate('location.search') == '', p.evaluate('location.search')   # nothing it could read is written back
    # partly good: the readable values still apply
    b.close()
    b, p, errs2 = open_page(pw, PHONE, '?p=multi:cty:JP+zzz:1+city:XX:Nowhere&y=1985&g=mov:nope&s=999999')
    s = p.evaluate(STATE)
    assert s['place'] == 'cty:JP' and s['year'] == 1985 and s['genre'] is None and s['from'] == 'until', s
    assert not errs and not errs2, (errs, errs2); b.close(); print('ok garbage ignored')

    # other parameters are left alone (the sign-in return and invites use the address too)
    b, p, errs = open_page(pw, PHONE, '?error=x&p=cty:JP')
    p.evaluate("setYear(1990); setStay(0); stApply();"); p.wait_for_timeout(800)
    q = p.evaluate('location.search')
    assert 'y=1990' in q and 'p=cty:JP' in q, q
    assert not errs, errs; b.close(); print('ok other parameters')

    # (e) Share copies an address that reproduces the state, panel included
    for vp, dark, tag in ((PHONE, False, 'phone-light'), (DESK, True, 'desktop-dark')):
        b, p, errs = open_page(pw, vp, dark=dark, clipboard=True)
        p.evaluate("setPlace({k:'cty',iso:'BR'}); setYear(1972); setStay(5); FG={k:'mov',id:'swing'}; stApply(); applyHighlight(); location.hash='map';")
        p.wait_for_timeout(500)
        p.evaluate("stPanelOpen=true; stBarUI(); stPanelUpdate();")
        p.wait_for_timeout(300)
        want = p.evaluate(STATE)
        p.evaluate("document.getElementById('shareb').click()")
        p.wait_for_timeout(250)
        assert 'copied' in p.inner_text('.sharetip'), p.inner_text('.sharetip')
        copied = p.evaluate('navigator.clipboard.readText()')
        no_sideways(p); shot(p, 'links-copy-' + tag)
        assert not errs, errs; b.close()
        assert copied.startswith('file://') and '#' not in copied, copied
        b, p, errs = open_page(pw, vp, '?' + copied.split('?', 1)[1])
        got = p.evaluate(STATE)
        assert got == want, (want, got, copied)
        assert not errs, errs; b.close()
        print('ok copy link', tag, '->', copied.split('?', 1)[1])

    # (e2) Share in the top bar copies the address, with the selected genre, and says so
    b, p, errs = open_page(pw, PHONE, clipboard=True)
    p.evaluate("setYear(1975); select('swing'); location.hash='list';")
    p.wait_for_timeout(700)
    assert p.is_visible('#shareb')
    p.click('#shareb'); p.wait_for_timeout(200)
    assert 'copied' in p.inner_text('.sharetip'), p.inner_text('.sharetip')
    copied = p.evaluate('navigator.clipboard.readText()')
    assert 'sel=swing' in copied and 'y=1975' in copied, copied
    no_sideways(p)
    assert not errs, errs; b.close()
    b, p, errs = open_page(pw, PHONE, '?' + copied.split('?', 1)[1])
    assert p.evaluate('selected') == 'swing' and p.evaluate('STY') == 1975
    assert not errs, errs; b.close(); print('ok share button ->', copied.split('?', 1)[1])
    # (e3) the tab title says what the link shows
    b, p, errs = open_page(pw, PHONE, '?p=cty:CA&y=2020&s=from:1980&g=mov:swing')
    p.wait_for_timeout(700)
    assert p.title() == 'Canada · 1980–2020 · ' + p.evaluate("byId.swing.name") + ' · World Music Time Machine', p.title()
    assert not errs, errs; b.close(); print('ok title')

    # (e4) the playlist panel: tabs, a play button per song, a row that unfolds, the display options pop-out
    b, p, errs = open_page(pw, PHONE, '?v=map&p=cty:JP&y=1985&s=0&pl=1')
    pane = lambda: p.evaluate("[...document.querySelectorAll('#stpanel [data-stpane]')].filter(x=>!x.hidden).map(x=>x.dataset.stpane)")
    click = lambda sel: (p.evaluate("document.querySelector(%r).click()" % sel), p.wait_for_timeout(200))
    assert pane() == ['songs'], pane()
    assert p.inner_text('#sthere') == 'Japan · 1985' and 'Heard there' in p.inner_text('#stgnote')
    n = p.locator('#stlinks .sgrow').count(); assert n > 5 and p.locator('#stlinks .sgrow .stplay').count() == n
    assert p.locator('#stlinks .sgfind').count() == 0
    click('#stlinks .sgrow'); assert p.locator('#stlinks .sgfind').count() == 1 and 'Wikipedia' in p.inner_text('#stlinks .sgfind')
    click('#stlinks .sgrow'); assert p.locator('#stlinks .sgfind').count() == 0
    assert not p.is_visible('#stmeta'); click('#stmore'); assert p.is_visible('#stmeta') and p.locator('#stmeta [data-nm]').count() == 2
    click('#stmeta [data-nm="rom"]'); assert p.evaluate('NMODE') == 'orig'; click('#stmeta [data-nm="rom"]'); assert p.evaluate('NMODE') == 'both'
    for t in ('listen', 'sounds', 'research', 'songs'):
        click('#sttabs button[data-sttab="%s"]' % t); assert pane() == [t], (t, pane())
    click('#sttabs button[data-sttab="listen"]')
    assert p.is_visible('#stcopy') and 'in development' in p.inner_text('#stg-spotify').lower() and not p.is_visible('#stprompt')
    click('#stplabel summary .rmain'); assert p.is_visible('#stprompt') and p.locator('#stpnames [data-pnm]').count() == 2
    click('#stplat button[data-plat="youtube"]'); assert p.is_visible('#stg-other') and 'Search YouTube' in p.inner_text('#stg-other') and p.evaluate("document.getElementById('stplayon').value") == 'youtube'
    click('#stplat button[data-plat="spotify"]')
    no_sideways(p); shot(p, 'links-panel-tabs')
    assert not errs, errs; b.close(); print('ok panel tabs')

    # (f) no sideways scroll at 400 px with a long multi-place, multi-genre state
    b, p, errs = open_page(pw, PHONE, '?v=map&p=multi:cty:JP+cty:BR+reg:eur+cty:NG&g=multi:mov:swing+band:%s&y=1960&s=from:1940&pl=1' % band)
    assert p.evaluate(STATE)['panel']
    no_sideways(p)
    assert not errs, errs; b.close(); print('ok 400 px')
