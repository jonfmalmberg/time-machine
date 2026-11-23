#!/usr/bin/env python3
"""Account block test with a stand-in for the Supabase library (no network, no real sign-in).

Checks: a visitor who does nothing loads no Supabase code; the signed-out, signed-in and
handle-saving states of the block; sign-out. Run after build.py: python3 tests/account.py [shots-dir]
"""
import os, sys
from playwright.sync_api import sync_playwright

PAGE = 'file://' + os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist', 'index.html'))
SHOTS = sys.argv[1] if len(sys.argv) > 1 else None

STUB = r"""
window.__sb={calls:[],session:null,profile:{handle:null,role:'beta',status:'pending'},taken:['jon'],invites:[],good:'AAAABBBBCCCC'};
window.supabase={createClient(url,key,opt){ const st=window.__sb; st.url=url; st.calls.push('createClient'); let cb=null;
  const q=(table)=>{ let upd=null; const o={
     select(){ return o; }, update(v){ upd=v; return o; }, is(){ return o; }, order(){ return o; },
     eq(){ if(upd){ st.calls.push('update '+JSON.stringify(upd));
              if(st.taken.includes(String(upd.handle).toLowerCase())) return Promise.resolve({error:{code:'23505',message:'duplicate key'}});
              Object.assign(st.profile,upd); return Promise.resolve({error:null}); } return o; },
     maybeSingle(){ st.calls.push('select '+table); return Promise.resolve({data:st.session?{...st.profile}:null,error:null}); },
     then(ok){ st.calls.push('list '+table); ok({data:st.invites.map(c=>({code:c})),error:null}); } }; return o; };
  return { from:q,
     rpc(name,args){ st.calls.push('rpc '+name+' '+JSON.stringify(args||{}));
        if(name==='create_invite'){ const c='1234ABCD00'+String(10+st.invites.length); st.invites.push(c); return Promise.resolve({data:c,error:null}); }
        if(name==='redeem_invite'){ const c=String(args.invite_code).replace(/[^0-9a-f]/gi,'').toUpperCase();
           if(c!==st.good) return Promise.resolve({data:null,error:{message:'That code is not valid or has already been used.'}});
           st.profile.status='active'; return Promise.resolve({data:{active:true,have:1,need:1},error:null}); } },
     auth:{
     onAuthStateChange(f){ cb=f; setTimeout(()=>f('INITIAL_SESSION',st.session),0); return {data:{subscription:{unsubscribe(){}}}}; },
     signInWithOAuth(o){ st.calls.push('oauth '+o.provider+' '+o.options.redirectTo); return Promise.resolve({error:null}); },
     signOut(){ st.session=null; cb('SIGNED_OUT',null); return Promise.resolve({error:null}); } } }; } };
"""

def open_page(pw, viewport, session=False, dark=False, query=''):
    errors, asked = [], []
    browser = pw.chromium.launch()
    ctx = browser.new_context(viewport=viewport, color_scheme='dark' if dark else 'light')
    page = ctx.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    def route(r):
        u = r.request.url
        if u.startswith('file:'): return r.continue_()
        if 'supabase' in u:
            asked.append(u)
            if u.endswith('/dist/umd/supabase.js'):
                pre = "window.__sb_session=true;" if session else ""
                body = STUB + ("window.__sb.session={user:{id:'u1'}};" if session else "")
                return r.fulfill(content_type='application/javascript', body=body)
        return r.abort()
    page.route('**/*', route)
    if session:  # a stored session makes the page load the library on start
        page.add_init_script("try{localStorage.setItem('sb-wpuowfaqrkgjqavhavcj-auth-token','x')}catch(e){}")
    page.goto(PAGE + query, wait_until='domcontentloaded'); page.wait_for_timeout(900)
    return browser, page, errors, asked

def shot(page, name):
    if SHOTS: page.screenshot(path=os.path.join(SHOTS, name + '.png'))

with sync_playwright() as pw:
    # 1. Anonymous visitor: nothing from Supabase is requested.
    b, p, errs, asked = open_page(pw, {'width': 400, 'height': 800})
    for t in p.evaluate("[...document.querySelectorAll('nav.tabbar .tab-link')].map(b=>b.id)"): p.click('#' + t)
    assert not asked, 'anonymous visit contacted Supabase: %r' % asked
    assert p.evaluate("window.ACCOUNT.env") == 'dev'
    p.click('#whobtn'); p.wait_for_timeout(500)
    assert p.is_visible('#acctin'), 'sign-in row missing'
    assert not asked, 'opening the sheet contacted Supabase'
    shot(p, 'acct_out_phone')
    p.click('#acctin'); p.wait_for_timeout(500)
    calls = p.evaluate("window.__sb.calls")
    assert any(c.startswith('oauth google file://') for c in calls), calls
    assert p.evaluate("window.__sb.url") == 'https://wpuowfaqrkgjqavhavcj.supabase.co'
    assert not errs, errs; b.close(); print('ok anonymous + sign-in start')

    # 2. Signed in: profile shown, handle rules, sign out.
    for name, vp, dark in (('phone', {'width': 400, 'height': 800}, False), ('desktop', {'width': 1280, 'height': 800}, True)):
        b, p, errs, asked = open_page(pw, vp, session=True, dark=dark)
        p.click('#whobtn'); p.wait_for_timeout(500)
        txt = p.inner_text('#acct')
        assert 'No handle yet' in txt and 'Under review' in txt, txt
        assert not p.is_visible('#acctsave'), 'Save shows before anything is typed'
        shot(p, 'acct_pending_' + name)
        p.fill('#accth', 'a b'); assert p.is_visible('#acctsave'); p.click('#acctsave'); p.wait_for_timeout(200)
        assert '3 to 24' in p.inner_text('#acct')
        p.fill('#accth', 'Jon'); p.click('#acctsave'); p.wait_for_timeout(300)
        assert 'taken' in p.inner_text('#acct')
        p.fill('#accth', 'night_owl'); p.press('#accth', 'Enter'); p.wait_for_timeout(300)
        assert 'night_owl' in p.inner_text('#acct .acctme') and p.is_visible('#acctok')
        assert not p.is_visible('#acctsave'), 'Save still shows after saving'
        shot(p, 'acct_saved_' + name)
        # invite code: wrong, then right
        assert not p.is_visible('#acctuse')
        p.fill('#acctcode', 'nope'); p.click('#acctuse'); p.wait_for_timeout(300)
        assert 'not valid' in p.inner_text('#acct') and 'Under review' in p.inner_text('#acct')
        p.fill('#acctcode', 'aaaa-bbbb-cccc'); p.press('#acctcode', 'Enter'); p.wait_for_timeout(400)
        txt = p.inner_text('#acct')
        assert 'Under review' not in txt and 'Beta tester' in txt and 'You are in' in txt, txt
        # active: make an invite link
        p.click('#acctnew'); p.wait_for_timeout(300)
        assert '1234-ABCD-0010' in p.inner_text('#acct')
        shot(p, 'acct_active_' + name)
        assert p.evaluate('document.documentElement.scrollWidth > innerWidth') is False
        p.click('#acctout'); p.wait_for_timeout(300)
        assert p.is_visible('#acctin') and p.evaluate("window.ACCOUNT.user()") is None
        assert not errs, errs; b.close(); print('ok signed in', name)

    # 3. Arriving by invite link: remembered, sheet opens, used automatically after sign-in.
    b, p, errs, asked = open_page(pw, {'width': 400, 'height': 800}, query='?invite=AAAA-BBBB-CCCC')
    p.wait_for_timeout(900)
    assert 'You have an invite' in p.inner_text('#acct') and p.is_visible('#acctin')
    assert 'invite' not in p.evaluate('location.search'), 'invite code left in the address bar'
    assert not asked, 'invite link contacted Supabase before sign-in'
    shot(p, 'acct_invited_phone'); assert not errs, errs; b.close()
    b, p, errs, asked = open_page(pw, {'width': 400, 'height': 800}, session=True, query='?invite=AAAA-BBBB-CCCC')
    p.wait_for_timeout(900)
    txt = p.inner_text('#acct')
    assert 'Beta tester' in txt and 'You are in' in txt and p.is_visible('#acctnew'), txt
    assert p.evaluate("localStorage.getItem('wmft-invite')") is None
    assert not errs, errs; b.close(); print('ok invite link')
