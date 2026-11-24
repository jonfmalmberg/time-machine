/* The landing page: the first thing a visitor who is not signed in sees. A slowly turning Earth, what the app is for in one
   line, a coloured button to sign in, and a plain one to go on without an account (which leads into the guided start).
   Signed-in people never see it. A visitor who has chosen to go on without an account is not shown it again on that
   device, and a shared link that already says where to go opens straight on its view. Automated browsers (the tests) skip
   it unless the address asks with ?landing=1. */
const KEY='wmft-anon';
const anon=()=>{ try{ return localStorage.getItem(KEY)==='1'; }catch(e){ return false; } };
/* a saved sign-in is in the browser's storage before the account module has finished reading it: do not flash the page at a member */
const hasSession=()=>{ try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(/^sb-.*-auth-token$/.test(k)) return true; } }catch(e){} return false; };
const asked=/[?&]landing=1\b/.test(location.search), linked=/[?&](p|y|g|pl|sel|v|code|invite|welcome)=/.test(location.search);
function build(){ const el=document.createElement('div'); el.id='landing'; el.setAttribute('role','dialog'); el.setAttribute('aria-label','World Music Time Machine');
  el.innerHTML=`<div class="lstars" aria-hidden="true"></div>
    <div class="lglobe" aria-hidden="true"><div class="learth"></div><div class="lshade"></div></div>
    <div class="ltext"><h1>World Music<br>Time Machine</h1><p>Explore the world's music by place and time. Find sounds you would never have heard.</p></div>
    <div class="lbtns"><button type="button" class="lgo" id="lsign">Sign in with Google</button><button type="button" class="lalt" id="lanon">Explore without an account</button>
      <p class="lfine">Signing in keeps a log of where you have been, so picks lean toward what you like. New accounts are let in by hand for now.</p></div>`;
  document.body.appendChild(el);
  // the same Earth the map uses: the file beside the page if there is one, otherwise NASA's Blue Marble
  const earth=el.querySelector('.learth'), use=u=>{ earth.style.backgroundImage=`url("${u}")`; el.classList.add('lit'); };
  const a=new Image(); a.onload=()=>use('earth.jpg'); a.onerror=()=>{ const b=new Image(); b.onload=()=>use(b.src); b.src='https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/earth-blue-marble.jpg'; }; a.src='earth.jpg';
  const close=()=>{ el.classList.add('out'); setTimeout(()=>el.remove(),450); };
  el.querySelector('#lanon').onclick=()=>{ try{ localStorage.setItem(KEY,'1'); }catch(e){} try{ window.TRACK&&window.TRACK('landing',{to:'anon'}); }catch(e){} close(); setTimeout(()=>window.WELCOME&&window.WELCOME.show(),380); };
  el.querySelector('#lsign').onclick=()=>{ try{ window.TRACK&&window.TRACK('landing',{to:'signin'}); window.TRACKFLUSH&&window.TRACKFLUSH(); }catch(e){}
    if(window.ACCOUNT&&window.ACCOUNT.signIn) window.ACCOUNT.signIn(); else if(window.ACCOUNT) { close(); window.ACCOUNT.open(); } };
  return el; }
window.LANDING={ up:false };
if(asked||(!anon()&&!hasSession()&&!linked&&!navigator.webdriver)){ window.LANDING.up=true; build(); }
