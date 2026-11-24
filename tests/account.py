#!/usr/bin/env python3
"""Account, travels and admin tests with a stand-in for the Supabase library (no network, no real sign-in).

Run after build.py: python3 tests/account.py [folder for screenshots]
"""
import os, sys, json
from playwright.sync_api import sync_playwright

PAGE = 'file://' + os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist', 'index.html'))
SHOTS = sys.argv[1] if len(sys.argv) > 1 else None

# A tiny in-memory imitation of the parts of supabase-js the site uses.
STUB = r"""
window.__sb=Object.assign({requests:[{id:7,kind:'listener',key:'cty:JP|1985-1985|heard|abc',ref:{pl:'cty:JP',label:'Japan',y0:1985,y1:1985,mode:'heard',prompt:'PROMPT TEXT'},n:3,status:'open',last_at:'2026-11-22T10:00:00Z'}],calls:[],session:null,profile:{handle:null,role:'beta',status:'pending'},taken:['jon'],invites:[],good:'AAAABBBBCCCC',trips:[],events:[],ideas:[{id:1,slug:'a',title:'Hear a preview',body:'',area:'Playlist',size:'M',by:'lead',status:'idea',pos:1,created_at:'2026-11-24T00:00:00Z'},{id:2,slug:'b',title:'A music course',body:'',area:'Journey',size:'L',by:'lead',status:'idea',pos:2,created_at:'2026-11-24T00:00:00Z'},{id:3,slug:'c',title:'Guess the decade',body:'',area:'Play',size:'M',by:'lead',status:'idea',pos:3,created_at:'2026-11-24T00:00:00Z'}],
  people:[{id:'u2',handle:'ada',role:'beta',status:'pending',joined:'2026-11-20T10:00:00Z'},{id:'u3',handle:'bix',role:'beta',status:'active',joined:'2026-11-19T10:00:00Z'}]},window.__sb_init||{});
window.supabase={createClient(url,key,opt){ const st=window.__sb; st.url=url; st.calls.push('createClient'); let cb=null;
  const q=(table)=>{ let op='select', val=null, f={}; const o={
     select(){ return o; }, update(v){ op='update'; val=v; return o; }, insert(v){ op='insert'; val=v; return o; }, upsert(v){ op='upsert'; val=v; return o; }, delete(){ op='delete'; return o; },
     eq(k,v){ f[k]=v; return o; }, is(){ return o; }, gt(){ return o; }, order(){ return o; }, limit(){ return o; },
     single(){ return new Promise(r=>o.then(x=>r({data:Array.isArray(x.data)?x.data[0]:x.data,error:x.error}))); },
     maybeSingle(){ st.calls.push('select '+table); return Promise.resolve({data:st.session?{...st.profile}:null,error:null}); },
     then(ok){ st.calls.push(op+' '+table); let data=null, error=null;
        if(table==='profiles'&&op==='update'){ if(st.taken.includes(String(val.handle).toLowerCase())) error={code:'23505',message:'duplicate key'}; else Object.assign(st.profile,val); }
        else if(table==='profiles') data=[{id:'u1',...st.profile,joined:'2026-11-18T10:00:00Z'},...st.people];
        else if(table==='requests'&&op==='update'){ const q=st.requests.find(x=>f.id!=null?x.id===f.id:(x.kind===f.kind&&x.key===f.key)); if(q) Object.assign(q,val); }
        else if(table==='requests') data=st.requests.filter(x=>x.status==='open');
        else if(table==='invites') data=st.invites.map(c=>({code:c,expires_at:new Date(Date.now()+13.5*864e5).toISOString()}));
        else if(table==='trips'&&op==='select') data=st.trips.filter(t=>!f.user_id||t.user_id===f.user_id);
        else if(table==='trips'&&op==='upsert'){ const i=st.trips.findIndex(t=>t.id===val.id); const row={user_id:'u1',...val}; if(i>=0) st.trips[i]=row; else st.trips.push(row); }
        else if(table==='trips'&&op==='delete'){ st.trips=st.trips.filter(t=>t.id!==f.id); }
        else if(table==='events'&&op==='insert'){ st.events.push(...val); }
        else if(table==='ideas'&&op==='select') data=st.ideas.slice().sort((a,b)=>a.pos-b.pos);
        else if(table==='ideas'&&op==='insert'){ const row={id:100+st.ideas.length,status:'idea',body:'',created_at:new Date().toISOString(),...val}; st.ideas.push(row); data=[row]; }
        else if(table==='ideas'&&op==='update'){ const r=st.ideas.find(x=>x.id===f.id); if(r) Object.assign(r,val); }
        else if(table==='ideas'&&op==='delete'){ st.ideas=st.ideas.filter(x=>x.id!==f.id); }
        ok({data,error}); } }; return o; };
  return { from:q,
     rpc(name,args){ st.calls.push('rpc '+name+' '+JSON.stringify(args||{}));
        if(name==='request_many'){ const out={}; args.req_items.forEach(it=>{ st.requests.push({id:100+st.requests.length,kind:args.req_kind,key:it.key,ref:it.ref,n:1,w:1/args.req_items.length,status:'open',last_at:new Date().toISOString()}); out[it.key]='open'; }); return Promise.resolve({data:out,error:null}); }
        if(name==='request_add'){ const ex=st.requests.find(x=>x.kind===args.req_kind&&x.key===args.req_key); if(ex){ ex.n++; return Promise.resolve({data:ex.status,error:null}); } st.requests.push({id:99,kind:args.req_kind,key:args.req_key,ref:args.req_ref,n:1,status:'open',last_at:new Date().toISOString()}); return Promise.resolve({data:'open',error:null}); }
        if(name==='create_invite'){ const c='1234ABCD00'+String(10+st.invites.length); st.invites.push(c); return Promise.resolve({data:c,error:null}); }
        if(name==='redeem_invite'){ const c=String(args.invite_code).replace(/[^0-9a-f]/gi,'').toUpperCase();
           if(c!==st.good) return Promise.resolve({data:null,error:{message:'That code is not valid, has expired or has already been used.'}});
           st.profile.status='active'; return Promise.resolve({data:{active:true,have:1,need:1},error:null}); }
        if(name==='admin_stats') return Promise.resolve({data:{requests:st.requests.filter(x=>x.status==='open').length,anon:212000,anon_cap:250000,anon7:5300,anon_from:'2026-11-01T00:00:00Z',active:2,pending:st.people.filter(p=>p.status==='pending').length,suspended:0,trips:st.trips.length,rated:0,events7:st.events.length,invites:0},error:null});
        if(name==='admin_usage') return Promise.resolve({data:{days:args.days,by_day:[{d:'2026-11-22',anon:12,member:2},{d:'2026-11-23',anon:30,member:5}],funnel:[{who:'anon',visits:42,stayed:30,chose:21,panel:18,played:6,took:9,shared:2,median_seconds:95},{who:'member',visits:7,stayed:7,chose:6,panel:5,played:3,took:4,shared:1,median_seconds:631}],actions:[{action:'view',n:200,member:40}],views:[{k:'map',n:40,member:6}],places:[{k:'cty:JP',n:12,member:3},{k:'city:MX:Tijuana',n:2,member:0}],genres:[{k:'mov:citypop',n:4,member:1}],decades:[{k:1980,n:15,member:2}],services:[{k:'spotify',n:6,member:3}],members:[{id:'u3',handle:'bix',visits:4,events:60,last:'2026-11-23T05:05:13Z',trips:3,reviewed:2}],trips:{total:3,rated:1,reviewed:2,mean_rating:8,by_status:{loved:1,copied:1,left:1}}},error:null});
        if(name==='admin_set_profile'){ const p=st.people.find(x=>x.id===args.target); p.role=args.new_role; p.status=args.new_status; return Promise.resolve({error:null}); } },
     auth:{
     onAuthStateChange(f){ cb=f; setTimeout(()=>f('INITIAL_SESSION',st.session),0); return {data:{subscription:{unsubscribe(){}}}}; },
     signInWithOAuth(o){ st.calls.push('oauth '+o.provider+' '+o.options.redirectTo); return Promise.resolve({error:null}); },
     signOut(){ st.session=null; cb('SIGNED_OUT',null); return Promise.resolve({error:null}); } } }; } };
"""

def open_page(pw, viewport, init=None, dark=False, query=''):
    """init: None for a visitor with no session; a dict to start signed in with that stand-in state."""
    errors, asked = [], []
    global anon, reqs; anon = []; reqs = []
    browser = pw.chromium.launch()
    page = browser.new_context(viewport=viewport, color_scheme='dark' if dark else 'light').new_page()
    # The playlist panel is tabbed. These scenarios check what each section holds, so every section is laid out at once
    # and the prompt is unfolded; the tabs themselves are checked in the scenario "panel tabs".
    page.add_init_script("""document.addEventListener('DOMContentLoaded',()=>{ const st=document.createElement('style'); st.textContent='#stpanel.alltabs:not([data-mode=genre]) [data-stpane][hidden],#stpanel.alltabs[data-mode=genre] [data-stpane]:not([data-stpane=sounds])[hidden]{display:block!important}'; document.head.appendChild(st); const pn=document.getElementById('stpanel'); if(pn) pn.classList.add('alltabs'); const d=document.getElementById('stplabel'); if(d) d.open=true; });""")
    page.on('pageerror', lambda e: errors.append(str(e)))
    def route(r):
        u = r.request.url
        if u.startswith('file:'): return r.continue_()
        if '/rest/v1/rpc/request_many' in u:   # one ask for several decades
            d = json.loads(r.request.post_data or '{}'); reqs.append(d); return r.fulfill(status=200, content_type='application/json', body=json.dumps({i['key']: 'open' for i in d['req_items']}))
        if '/rest/v1/rpc/request_add' in u:   # a visitor's request: plain call, no library
            reqs.append(json.loads(r.request.post_data or '{}')); return r.fulfill(status=200, content_type='application/json', body='"open"')
        if '/rest/v1/anon_events' in u:   # the anonymous usage log: plain requests, no library
            anon.extend(json.loads(r.request.post_data or '[]')); return r.fulfill(status=201, body='')
        if 'supabase' in u:
            asked.append(u)
            if u.endswith('/dist/umd/supabase.js'): return r.fulfill(content_type='application/javascript', body=STUB)
        return r.abort()
    page.route('**/*', route)
    if init is not None:   # a stored session makes the page load the library on start
        state = {'session': {'user': {'id': 'u1'}}}; state.update(init)
        page.add_init_script("try{localStorage.setItem('sb-wpuowfaqrkgjqavhavcj-auth-token','x')}catch(e){};window.__sb_init=" + json.dumps(state))
    page.goto(PAGE + query, wait_until='domcontentloaded'); page.wait_for_timeout(1000)
    return browser, page, errors, asked

def shot(page, name):
    if SHOTS: page.screenshot(path=os.path.join(SHOTS, name + '.png'))
PHONE, DESK = {'width': 400, 'height': 800}, {'width': 1280, 'height': 800}
ACTIVE = {'handle': 'night_owl', 'role': 'beta', 'status': 'active'}

with sync_playwright() as pw:
    # 1. Anonymous visitor: nothing from Supabase is requested; no trace of the old name-and-PIN list.
    b, p, errs, asked = open_page(pw, PHONE)
    for t in p.evaluate("[...document.querySelectorAll('nav.tabbar .tab-link')].map(b=>b.id)"): p.click('#' + t)
    assert not asked, 'anonymous visit loaded the sign-in library: %r' % asked
    assert p.evaluate('COVERS') is False, 'album art is not switched off'
    assert p.locator('#tab-me').is_hidden() and p.locator('nav.tabbar .tab-link').count() == 6, 'Me is still in the tab bar'
    p.click('#whobtn'); p.wait_for_timeout(300)
    assert p.inner_text('#vtitle') == 'Account' and 'Travelling as a guest' in p.inner_text('#view-me')
    assert p.is_visible('#acctin') and not asked
    assert 'PIN' not in p.inner_text('#view-me') and p.locator('#whoname').count() == 0, 'old people list still present'
    shot(p, 'acct_out_phone')
    # anonymous usage log: filter choice and views are sent without the library; nothing identifying
    p.evaluate("setPlace({k:'cty',iso:'JP'})"); p.wait_for_timeout(2800)
    p.evaluate("window.TRACKFLUSH()"); p.wait_for_timeout(300)
    acts = [e['action'] for e in anon]; assert 'session' in acts and 'view' in acts and 'filter' in acts, acts
    assert [e for e in anon if e['action'] == 'filter'][0]['ref']['pl'] == 'cty:JP'
    assert all(set(e) == {'session', 'action', 'ref'} for e in anon), 'unexpected fields in anonymous events'
    p.click('#whobtn'); p.wait_for_timeout(300); assert p.evaluate("curView()") != 'me', 'second tap on the account button did not go back'
    # Random: after a pick, "Shuffle again" repeats the same kind in one tap, and each pick is logged with its place in the run
    p.evaluate("document.getElementById('tab-tree').click()"); p.wait_for_timeout(300); p.click('#mrandb'); p.wait_for_timeout(400); p.click("#mrand [data-go='rollany']"); p.wait_for_selector('#reshuf', state='visible', timeout=8000)
    for _ in range(2):
        p.click('#reshuf'); p.wait_for_timeout(300); p.wait_for_function('!rolling', timeout=8000); p.wait_for_timeout(400)
    p.evaluate("window.TRACKFLUSH()"); p.wait_for_timeout(300)
    rnd = [e['ref'] for e in anon if e['action'] == 'random']
    assert [r['n'] for r in rnd] == [1, 2, 3] and all(r['kind'] == 'rollany' and r['to'] for r in rnd), rnd
    shot(p, 'reshuffle_phone'); p.click('#reshufx'); p.wait_for_timeout(200); assert not p.is_visible('#reshuf')
    # a random genre opens its playlist sheet over the view the person is in, not the list
    assert p.evaluate("curView()") == 'tree' and p.evaluate('GP') == rnd[-1]['to'] and p.is_visible('#stpanel') and p.inner_text('#sthere') == p.evaluate("byId[GP].name")
    p.evaluate('closeGenrePlaylist()'); p.wait_for_timeout(200)
    # requests without an account: a listener test of the prompt on screen, and research for an unresearched decade
    p.evaluate("document.getElementById('tab-map').click()"); p.wait_for_timeout(300)
    p.evaluate("resetFilters('all'); setYear(1985); setStay(0); setPlace({k:'cty',iso:'JP'}); stPanelOpen=true; stBarUI(); stPanelUpdate()"); p.wait_for_timeout(400)
    # Japan 1985 has year lists and a recorded listener test: both rows say so and offer no button to a visitor
    st = p.inner_text('#ststatus')
    assert 'Researched' in st and 'Sources not checked' in st and 'Passed' in st and 'Japan, 1980s' in st, st
    assert p.locator('#ststatus button[data-rqi]').count() == 0, 'a visitor is offered a rerun'
    # tapping a row opens a card that explains the result without prior context
    p.click('.rq[data-kind="listener"] .rqm'); p.wait_for_timeout(500); card = p.inner_text('#sheet-detail')
    assert 'Passed' in card and 'music of my youth' in card and '8 out of 10' in card and 'simulated' in card and card.count('meets it') == 3, card
    shot(p, 'card_listener_pass_phone'); p.evaluate('UI.sheet.close()'); p.wait_for_timeout(350)
    p.click('.rq[data-kind="research"] .rqm'); p.wait_for_timeout(500); card = p.inner_text('#sheet-detail')
    assert 'Researched' in card and 'By year' in card and '6 or more home-grown' in card and 'Sources not checked yet' in card, card
    shot(p, 'card_research_phone'); p.evaluate('UI.sheet.close()'); p.wait_for_timeout(350)
    # India 2015 (Japan now has chart lists for most years): decade list only, never tested: both buttons
    p.evaluate("setYear(2015); setPlace({k:'cty',iso:'IN'}); stPanelUpdate()"); p.wait_for_timeout(400)
    assert p.inner_text('#sttest') == 'Request' and p.inner_text('#streq') == 'Request' and 'Not tested' in p.inner_text('#ststatus') and 'Decade list only' in p.inner_text('#ststatus')
    p.evaluate("document.getElementById('sttest').click()"); p.wait_for_timeout(400)
    assert len(reqs) == 1 and reqs[0]['req_kind'] == 'listener' and reqs[0]['req_ref']['pl'] == 'cty:IN' and reqs[0]['req_ref']['y0'] == 2015 and len(reqs[0]['req_ref']['prompt']) > 100, reqs
    assert 'Requested' in p.inner_text('.rq[data-kind="listener"]') and p.locator('#sttest').count() == 0
    shot(p, 'request_listener_phone')
    p.evaluate("setYear(1955); setPlace({k:'cty',iso:'AR'}); stPanelUpdate()"); p.wait_for_timeout(400)
    p.evaluate("document.getElementById('streq').click()"); p.wait_for_timeout(400)
    assert reqs[-1]['req_kind'] == 'research' and reqs[-1]['req_key'] == 'AR_1950_new' and 'Requested' in p.inner_text('.rq[data-kind="research"]'), reqs[-1]
    # research is asked for in the pieces it is done in: one country, decade by decade. No country or before 1940: nothing to ask for.
    p.evaluate("setYear(1850); setPlace(null); stPanelUpdate()"); p.wait_for_timeout(400)
    assert p.locator('#sttest').count() == 1 and p.locator('#streq').count() == 0 and 'Choose a country' in p.inner_text('#ststatus'), p.inner_text('#ststatus')
    # the Netherlands (no year lists) over all of history: every decade from the 1940s, one request shared between the unresearched ones
    p.evaluate("resetFilters('all'); setPlace({k:'cty',iso:'NL'}); stPanelOpen=true; stBarUI(); stPanelUpdate()"); p.wait_for_timeout(400)
    todo = p.evaluate("[1940,1950,1960,1970,1980,1990,2000,2010,2020].filter(d=>!Object.keys(YEARL.NL||{}).some(y=>decadeKey(+y)===String(d)))")
    assert len(todo) >= 2 and '9 decades' in p.inner_text('#ststatus') and p.inner_text('#streq') == 'Request %d decades' % len(todo), (todo, p.inner_text('#ststatus'))
    p.evaluate("document.getElementById('streq').click()"); p.wait_for_timeout(400)
    assert reqs[-1]['req_kind'] == 'research' and [i['key'] for i in reqs[-1]['req_items']] == ['NL_%d_new' % d for d in todo], reqs[-1]
    assert p.locator('#streq').count() == 0 and 'Requested' in p.inner_text('.rq[data-kind="research"]'); shot(p, 'request_decades_phone')
    n_before = len(reqs)   # narrowing to one of those decades shows it as already asked for
    p.evaluate("setYear(%d); setStay(0); stPanelUpdate()" % (todo[-1] + 1)); p.wait_for_timeout(400)
    assert p.locator('#streq').count() == 0 and 'Requested' in p.inner_text('.rq[data-kind="research"]') and len(reqs) == n_before, p.inner_text('#ststatus')
    # the listener test logs the filters as they are
    p.evaluate("resetFilters('all'); setPlace({k:'cty',iso:'GB'}); stPanelOpen=true; stBarUI(); stPanelUpdate()"); p.wait_for_timeout(400)
    p.evaluate("document.getElementById('sttest').click()"); p.wait_for_timeout(400)
    f = reqs[-1]['req_ref']['filter']; assert reqs[-1]['req_kind'] == 'listener' and f['pl'] == 'cty:GB' and f['until'] is True and f['y1'] >= 2026 and f['y0'] < 0, reqs[-1]['req_ref']
    # genres: the list has one Playlist button per genre, which opens the same panel
    p.evaluate("resetFilters('all'); stPanelOpen=false; stBarUI()")
    p.evaluate("document.getElementById('tab-list').click()"); p.wait_for_timeout(400)
    n_g, n_b = p.evaluate("[document.querySelectorAll('#listbody .gitem').length, document.querySelectorAll('#listbody [data-gpl]').length]")
    assert n_g > 100 and n_g == n_b and p.locator('#listbody details.pl').count() == 0, (n_g, n_b)
    full = p.evaluate("Object.keys(PL).find(k=>PL[k].status==='full'&&DEFS[k])"); pend = p.evaluate("Object.keys(byId).find(k=>!DEFS[k])")
    p.evaluate("openGenrePlaylist(%r)" % full); p.wait_for_timeout(400)
    assert p.is_visible('#stpanel') and p.is_visible('#stcopy') and not p.is_visible('#stspan') and not p.is_visible('#stpeaks')
    assert p.input_value('#stprompt') == p.evaluate("promptFor(%r)" % full) and p.locator('#stlinks ol li').count() > 3
    st = p.inner_text('#ststatus'); assert 'Researched' in st and p.locator('#streq').count() == 0 and p.inner_text('#sttest') == 'Request', st
    p.evaluate("document.getElementById('sttest').click()"); p.wait_for_timeout(400)
    assert reqs[-1]['req_kind'] == 'listener' and reqs[-1]['req_key'].startswith('g:' + full + '|') and reqs[-1]['req_ref']['gid'] == full, reqs[-1]
    shot(p, 'genre_playlist_phone')
    # a genre that came in through the master-table step (tools/ingest.py): every song checked, so Verified
    ing = 'jota'
    p.evaluate("openGenrePlaylist(%r)" % ing); p.wait_for_timeout(400)
    assert p.is_visible('#stprompt') and p.input_value('#stprompt') == p.evaluate("promptFor(%r)" % ing) and p.locator('#stlinks ol li').count() > 3
    st = p.inner_text('.rq[data-kind="research"]')
    assert ('Researched' in st or 'Thin' in st) and 'Sources checked' in st and 'not checked' not in st and 'partly' not in st, st
    assert p.evaluate("DATA.verified.g[%r].checked===DATA.verified.g[%r].links&&DATA.verified.g[%r].links>0" % (ing, ing, ing))
    shot(p, 'genre_verified_phone')
    p.click('.rq[data-kind="research"] .rqm'); p.wait_for_timeout(500); card = p.inner_text('#sheet-detail')
    assert 'Sources checked' in card and 'found on the page cited for it' in card and 'not checked yet' not in card, card
    shot(p, 'card_genre_verified_phone'); p.evaluate('UI.sheet.close()'); p.wait_for_timeout(350)
    p.evaluate("openGenrePlaylist('swing')"); p.wait_for_timeout(400)
    st = p.inner_text('.rq[data-kind="research"]'); assert 'Sources not checked' in st, st
    p.evaluate("openGenrePlaylist(%r)" % pend); p.wait_for_timeout(400)
    assert not p.is_visible('#stprompt') and not p.is_visible('#stcopy') and p.locator('#sttest').count() == 1 and p.locator('#streq').count() == 1, 'pending genre lacks a button'
    p.evaluate("document.getElementById('streq').click()"); p.wait_for_timeout(400)
    assert reqs[-1]['req_key'] == 'g:' + pend + '_new' and 'Requested' in p.inner_text('.rq[data-kind="research"]'), reqs[-1]
    shot(p, 'genre_pending_phone')
    # a genre's playlist sheet stays over the tree, map, tunnel and list, and closes on the views that have no sheet
    p.evaluate("showView('map')"); p.wait_for_timeout(300); assert p.is_visible('#stpanel') and p.evaluate("GP") is not None, 'genre playlist closed on the map'
    p.evaluate("showView('data')"); p.wait_for_timeout(300); assert not p.is_visible('#stpanel') and p.evaluate("GP") is None, 'genre playlist stayed open on the data view'
    p.evaluate("showView('map')"); p.wait_for_timeout(200)
    p.evaluate("stPanelOpen=false; stBarUI()")
    p.click('#whobtn'); p.wait_for_timeout(300)
    p.click('#acctin'); p.wait_for_timeout(500)
    assert any(c.startswith('oauth google file://') for c in p.evaluate("window.__sb.calls"))
    assert p.evaluate("window.__sb.url") == 'https://wpuowfaqrkgjqavhavcj.supabase.co'
    assert not errs, errs; b.close(); print('ok anonymous + sign-in start')

    # 2. Pending: review state everywhere, handle rules, invite code lets them in, then invites and sign-out.
    for name, vp, dark in (('phone', PHONE, False), ('desktop', DESK, True)):
        b, p, errs, asked = open_page(pw, vp, init={}, dark=dark)
        assert 'wait' in p.get_attribute('#whobtn', 'class'), 'account button does not show review state'
        p.click('#whobtn'); p.wait_for_timeout(500)
        assert 'Under review' in p.inner_text('#view-me')
        txt = p.inner_text('#acctbox'); assert 'No handle yet' in txt and 'Under review' in txt, txt
        assert not p.is_visible('#acctsave'), 'Save shows before anything is typed'
        p.fill('#accth', 'a b'); p.click('#acctsave'); p.wait_for_timeout(200); assert '3 to 24' in p.inner_text('#acctbox')
        p.fill('#accth', 'Jon'); p.click('#acctsave'); p.wait_for_timeout(300); assert 'taken' in p.inner_text('#acctbox')
        p.fill('#accth', 'night_owl'); p.press('#accth', 'Enter'); p.wait_for_timeout(300)
        assert p.is_visible('#acctok') and not p.is_visible('#acctsave')
        assert p.inner_text('#whobtn').strip() == 'N', 'account button does not show the handle initial'
        shot(p, 'acct_pending_' + name)
        p.fill('#acctcode', 'nope'); p.click('#acctuse'); p.wait_for_timeout(300); assert 'not valid' in p.inner_text('#acctbox')
        p.fill('#acctcode', 'aaaa-bbbb-cccc'); p.press('#acctcode', 'Enter'); p.wait_for_timeout(500)
        txt = p.inner_text('#view-me'); assert 'Under review' not in txt and 'Beta tester' in p.inner_text('#view-me .mewho') and 'You are in' in txt, txt
        assert 'wait' not in p.get_attribute('#whobtn', 'class')
        assert 'night_owl' in p.inner_text('#view-me .mewho') and p.locator("[data-page='me']").count() == 1, 'Account page did not follow the account'
        p.click('#acctnew'); p.wait_for_timeout(300)
        assert '1234-ABCD-0010' in p.inner_text('#acctbox') and 'Expires in 14 days' in p.inner_text('#acctbox'); shot(p, 'acct_active_' + name)
        assert p.evaluate('document.documentElement.scrollWidth > innerWidth') is False
        p.click('#acctout'); p.wait_for_timeout(300)
        assert p.is_visible('#acctin') and 'Travelling as a guest' in p.inner_text('#view-me')
        assert not errs, errs; b.close(); print('ok pending to active', name)

    # 3. Active tester: a copied prompt becomes a trip in the database, marks and removal follow, events are sent.
    old = {'id': '11111111-1111-4111-8111-111111111111', 'user_id': 'u1', 'kind': 'trip', 'key': 'city:JP:Tokyo|1985|5||heard', 'place': {'k': 'city', 'c': 'JP:Tokyo', 'iso': 'JP'},
           'iso': 'JP', 'reg': 'easia', 'year': 1985, 'span': 5, 'from_year': None, 'mode': 'heard', 'gid': None, 'label': None, 'status': 'loved', 'react': 'love', 'rating': 9,
           'note': 'city pop', 'n': 1, 'created_at': '2026-11-01T10:00:00Z', 'updated_at': '2026-11-01T10:00:00Z'}
    b, p, errs, asked = open_page(pw, PHONE, init={'profile': ACTIVE, 'trips': [old]})
    p.click('#whobtn'); p.wait_for_timeout(500)
    txt = p.inner_text('#view-me'); assert 'Tokyo' in txt and 'the 1980s' in txt, 'trip from the database not shown with its place and decade: ' + txt[:300]
    p.evaluate("resetFilters('all'); setYear(1975); setStay(5); setPlace({k:'cty',iso:'BR'}); logCopy('moment',{place:placeName(),iso:'BR',year:1975,span:5,when:stWhen(),mode:'heard'})")
    p.wait_for_timeout(400)
    rows = p.evaluate("window.__sb.trips"); new = [r for r in rows if r['iso'] == 'BR']
    assert len(new) == 1 and new[0]['place'] == {'k': 'cty', 'iso': 'BR'} and new[0]['key'] == 'cty:BR|1975|5||heard' and new[0]['label'] is None, new
    p.wait_for_timeout(300); assert 'Brazil' in p.inner_text('#view-me'); shot(p, 'me_active_phone')
    p.click(".trip[data-hid='%s'] .tact.a-listened" % new[0]['id']); p.wait_for_timeout(300)
    assert [r for r in p.evaluate("window.__sb.trips") if r['iso'] == 'BR'][0]['status'] == 'listened'
    p.evaluate("window.PEOPLE.remove('%s')" % new[0]['id']); p.wait_for_timeout(300)
    assert not [r for r in p.evaluate("window.__sb.trips") if r['iso'] == 'BR'], 'removal did not reach the database'
    p.evaluate("Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true}); document.dispatchEvent(new Event('visibilitychange'))"); p.wait_for_timeout(300)
    acts = [e['action'] for e in p.evaluate("window.__sb.events")]
    assert 'session' in acts and 'view' in acts and 'copy' in acts, acts
    assert p.locator("[data-page='admin']").count() == 0, 'a beta tester sees the admin switch'
    assert not anon, 'an active tester was also logged anonymously'
    # playing a song logs a trip and puts the feedback row in the panel; one tap marks it, the slider scores it
    p.evaluate("document.getElementById('tab-map').click()"); p.wait_for_timeout(300)
    p.evaluate("window.open=()=>null; resetFilters('all'); setYear(1975); setStay(0); setPlace({k:'cty',iso:'BR'}); stPanelOpen=true; stBarUI(); stPanelUpdate()"); p.wait_for_timeout(500)
    n0 = p.evaluate("window.__sb.trips.length"); assert p.evaluate("!document.getElementById('stfb')||document.getElementById('stfb').hidden")
    p.evaluate("document.querySelector('#stlinks .stplay').click()"); p.wait_for_timeout(500)
    assert p.evaluate("window.__sb.trips.length") == n0 + 1 and p.is_visible('#stfb') and 'How is it?' in p.inner_text('#stfb')
    p.evaluate("document.querySelector('#stlinks .stplay').click()"); p.wait_for_timeout(300); assert p.evaluate("window.__sb.trips.length") == n0 + 1, 'a second play logged a second trip'
    shot(p, 'trip_feedback_ask'); p.evaluate("document.querySelector('#stfb [data-fb=loved]').click()"); p.wait_for_timeout(400)
    assert p.evaluate("window.__sb.trips.find(t=>t.iso==='BR').status") == 'loved' and p.locator('#stfbr').count() == 1
    p.evaluate("(()=>{const r=document.getElementById('stfbr'); r.value=9; r.dispatchEvent(new Event('change',{bubbles:true}));})()"); p.wait_for_timeout(400)
    assert p.evaluate("window.__sb.trips.find(t=>t.iso==='BR').rating") == 9; shot(p, 'trip_feedback_marked')
    assert p.evaluate('document.documentElement.scrollWidth > innerWidth') is False
    assert not errs, errs; b.close(); print('ok travels + events')

    # 4. Owner: admin page lists people, lets one in, opens a tester.
    for name, vp, dark in (('phone', PHONE, False), ('desktop', DESK, True)):
        b, p, errs, asked = open_page(pw, vp, init={'profile': {'handle': 'jon_m', 'role': 'owner', 'status': 'active'}, 'trips': [dict(old, user_id='u3')]}, dark=dark)
        p.click('#whobtn'); p.wait_for_timeout(300); p.click("[data-page='admin']"); p.wait_for_timeout(600)
        # Usage is the first part: both kinds of visitor side by side, signed-in people listed
        txt = p.inner_text('#view-me').lower(); assert 'how far visits get' in txt and 'not signed in' in txt and 'signed in' in txt and 'japan' in txt and 'city pop' in txt and '1980s' in txt and 'bix' in txt and 'nearly full' in txt and '212,000 of 250,000' in txt, txt
        assert '49' in p.inner_text('.mestats'), p.inner_text('.mestats')
        shot(p, 'admin_' + name)
        p.click("[data-addays='30']"); p.wait_for_timeout(500); assert any('admin_usage {"days":30}' in c for c in p.evaluate("window.__sb.calls"))
        # Ideas: add one, it goes to the top; drag the third above the first; open one and change its state
        p.click("[data-adtab='ideas']"); p.wait_for_timeout(500); assert p.locator('.idrow').count() == 3
        p.fill('#idnew', 'A passport of stamps'); p.press('#idnew', 'Enter'); p.wait_for_timeout(400)
        assert p.locator('.idrow').first.inner_text().startswith('1A passport') or 'A passport' in p.locator('.idrow').first.inner_text()
        h = p.locator('.idrow').nth(3).locator('.idh').bounding_box(); p.mouse.move(h['x'] + 10, h['y'] + 20); p.mouse.down(); p.mouse.move(h['x'] + 10, h['y'] + 20 - 56 * 3 - 10, steps=6); p.mouse.up(); p.wait_for_timeout(500)
        assert 'Guess the decade' in p.locator('.idrow').first.inner_text(), p.inner_text('#idlist')
        shot(p, 'admin_ideas_' + name)
        p.locator('.idrow').first.locator('.idmain').click(); p.wait_for_timeout(400); p.click("[data-idst='done']"); p.wait_for_timeout(400)
        assert p.evaluate("window.__sb.ideas.find(x=>x.id===3).status") == 'done'; p.evaluate("UI.sheet.close()"); p.wait_for_timeout(300)
        assert p.locator('.idrow').count() == 3
        # Requests
        p.click("[data-adtab='requests']"); p.wait_for_timeout(400); txt = p.inner_text('#view-me').lower()
        assert 'listener test · japan · 1985' in txt and 'asked 3 times' in txt, txt
        p.click("[data-rq='7']"); p.wait_for_timeout(400); assert 'PROMPT TEXT' in p.input_value('.adprompt')
        p.click(".adact[data-st='done']"); p.wait_for_timeout(600)
        assert p.evaluate("window.__sb.requests[0].status") == 'done' and 'No open requests' in p.inner_text('#view-me')
        # People
        p.click("[data-adtab='people']"); p.wait_for_timeout(400); txt = p.inner_text('#view-me').lower(); assert 'ada' in txt and 'bix' in txt and 'waiting to be let in' in txt, txt
        p.click("[data-ok='u2']"); p.wait_for_timeout(500)
        assert p.evaluate("window.__sb.people.find(x=>x.id==='u2').status") == 'active' and 'waiting to be let in' not in p.inner_text('#view-me').lower()
        p.click("[data-ap='u3']"); p.wait_for_timeout(500)
        assert 'Tokyo' in p.inner_text('#sheet-detail') and 'Suspend' in p.inner_text('#sheet-detail'); shot(p, 'admin_tester_' + name)
        # the owner may ask for finished work to be run again; a finished request goes back on the open list
        p.evaluate("UI.sheet.close(); window.__sb.requests.push({id:8,kind:'research',key:'JP_1980_rerun',ref:{},n:1,status:'done',last_at:'2026-11-22T10:00:00Z'})")
        p.evaluate("document.getElementById('tab-map').click()"); p.wait_for_timeout(300)
        p.evaluate("resetFilters('all'); setYear(1985); setStay(0); setPlace({k:'cty',iso:'JP'}); stPanelOpen=true; stBarUI(); stPanelUpdate()"); p.wait_for_timeout(400)
        assert p.inner_text('#streq') == 'Rerun' and p.inner_text('#sttest') == 'Rerun', p.inner_text('#ststatus')
        shot(p, 'rerun_' + name)
        p.evaluate("document.getElementById('streq').click()"); p.wait_for_timeout(500)
        assert p.evaluate("window.__sb.requests.find(x=>x.id===8).status") == 'open' and 'Rerun requested' in p.inner_text('.rq[data-kind="research"]')
        p.evaluate("document.getElementById('sttest').click()"); p.wait_for_timeout(500)
        assert p.evaluate("window.__sb.requests.some(x=>x.kind==='listener'&&x.ref&&x.ref.rerun&&x.status==='open')") and 'Rerun requested' in p.inner_text('.rq[data-kind="listener"]')
        p.evaluate("stPanelOpen=false; stBarUI()")
        assert p.evaluate('document.documentElement.scrollWidth > innerWidth') is False
        assert not errs, errs; b.close(); print('ok admin', name)

    # 5. Invite link: remembered, sheet opens, used automatically after sign-in.
    b, p, errs, asked = open_page(pw, PHONE, query='?invite=AAAA-BBBB-CCCC'); p.wait_for_timeout(900)
    assert p.evaluate('curView()') == 'me' and 'You have an invite' in p.inner_text('#acctbox') and p.is_visible('#acctin')
    assert 'invite' not in p.evaluate('location.search') and not asked
    assert not errs, errs; b.close()
    b, p, errs, asked = open_page(pw, PHONE, init={}, query='?invite=AAAA-BBBB-CCCC'); p.wait_for_timeout(900)
    txt = p.inner_text('#view-me'); assert 'Beta tester' in p.inner_text('#view-me .mewho') and 'You are in' in txt and p.is_visible('#acctnew'), txt
    assert p.evaluate("localStorage.getItem('wmft-invite')") is None
    assert not errs, errs; b.close(); print('ok invite link')
