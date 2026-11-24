/* The first visit (roadmap 1.5, section 2). One question, "Where do you want to go?", with three one-tap answers; the app goes
   there and opens the playlist on its songs, with one line saying what to do; after the first song is played, one line points
   at the whole playlist, and then one at the next step. Skippable, and reachable again from the information sheet. Not shown
   when a link already says where to go, or to an automated browser (the tests), unless the address asks with ?welcome=1. */
const KEY='wmft-welcome';
const seen=()=>{ try{ return localStorage.getItem(KEY)==='1'; }catch(e){ return false; } };
const mark=()=>{ try{ localStorage.setItem(KEY,'1'); }catch(e){} };
/* the decade of a country with the most year lists, preferring ones people alive today remember */
function bestDecade(iso){ const cnt={}; try{ Object.keys(YEARL[iso]||{}).forEach(y=>{ if(((YEARL[iso][y].songs)||[]).length>=6){ const d=Math.floor(+y/10)*10; cnt[d]=(cnt[d]||0)+1; } }); }catch(e){}
  const pref=[1980,1990,1970,2000,2010,1960], full=pref.filter(d=>cnt[d]>=6); if(full.length) return full[0];
  const any=Object.keys(cnt).map(Number).sort((a,b)=>cnt[b]-cnt[a]); return any.length?any[0]:null; }
function home(){ let r=''; try{ const m=/[-_]([A-Za-z]{2})\b/.exec(navigator.language||''); r=m?m[1].toUpperCase():''; }catch(e){} return r&&ISO[r]&&bestDecade(r)!=null?r:null; }
function choices(){ const h=home(), far=['JP','BR','SE','US','CA'].filter(i=>i!==h&&ISO[i]&&bestDecade(i)!=null), out=[];
  if(h) out.push({iso:h,dec:bestDecade(h),why:'Close to home'});
  far.slice(0,h?1:2).forEach(i=>out.push({iso:i,dec:bestDecade(i),why:out.length?'Somewhere else entirely':'A place to start'}));
  return out; }
function go(iso,dec){ stopPlay(); GP=null; setPlace({k:'cty',iso}); setYear(Math.min(T1,dec+9)); setStay('from',dec); FG=null; stApply(); applyHighlight(); syncLegend();
  if(curView()!=='map') location.hash='map';
  STTAB='songs'; stPanelOpen=true; stBarUI(); stPanelUpdate(); coach(1);
  if(window.FILTERS&&window.FILTERS.paint){ try{ window.FILTERS.paint(); }catch(e){} }
  try{ window.TRACK&&window.TRACK('welcome',{to:'cty:'+iso,d:dec}); }catch(e){} }
/* four hints, one at a time, under the playlist's tabs: play a song; where the whole playlist is; where to go next; where
   the travel log is */
let step=0;
const HINT={1:()=>`This is what was on the radio there. Tap ${UI.ic('play')} to hear a song.`,
  2:()=>`Want all of it? Open <b>Listen</b> for a playlist on Spotify, YouTube or Apple Music, or the plain song list.`,
  3:()=>`Now try other years with the chips at the top, or open <b>Sounds</b> to follow a genre to where it came from.`,
  4:()=>(window.ACCOUNT&&window.ACCOUNT.user&&window.ACCOUNT.user())?`Everywhere you go is kept in your travel log. It is under the round button at the top right.`:`The round button at the top right is your account. Sign in there and the places you visit are kept in a travel log.`};
function coach(n){ step=n; const c=document.getElementById('stcoach'); if(!c) return; c.hidden=!n;
  const lt=document.querySelector('#sttabs button[data-sttab="listen"]'); if(lt) lt.classList.toggle('nudge',n===2);
  const wb=document.getElementById('whobtn'); if(wb) wb.classList.toggle('nudge',n===4);
  if(n) c.innerHTML=`<span>${HINT[n]()}</span><span class="stcoachf"><small>${n} of 4</small><button type="button" class="lbtn" id="stcoachn">${n<4?'Next':'Done'}</button></span>`; }
/* every hint can be stepped past with its own button, so the tour never depends on the person doing the thing it names */
document.addEventListener('click',e=>{ if(e.target.closest&&e.target.closest('#stcoachn')){ coach(step<4?step+1:0); } });
/* While the tour is on, a play button does not leave the app: it shows what it would open, and the tour moves on. The
   button still answers the tap, so it never feels dead. */
let tip=null, tipT=0;
function say(t){ if(!tip){ tip=document.createElement('div'); tip.className='sharetip'; tip.setAttribute('role','status'); document.body.appendChild(tip); } tip.textContent=t; tip.classList.add('on'); clearTimeout(tipT); tipT=setTimeout(()=>tip.classList.remove('on'),3200); }
function hold(btn,service){ if(!step) return false; const t=btn.dataset.t||'this song';
  btn.classList.add('held'); setTimeout(()=>btn.classList.remove('held'),900);
  say(`That opens “${t}” on ${service}. Staying here for the tour.`); if(step===1) coach(2); return true; }
function show(){ const C=choices(), row=(attr,icon,t,sub)=>`<button type="button" class="rowb wrow" ${attr}><span class="rmedia">${UI.ic(icon)}</span><span class="rmain"><b>${t}</b><small>${sub}</small></span>${UI.ic('chev')}</button>`;
  const b=UI.detail('Where do you want to go?',`<p class="ablead wlead">Explore the world's music by place and time, and find sounds you would never have heard.</p>
    <div class="rows">${C.map((c,i)=>row(`data-w="${i}"`,'pin',`${esc(isoName(c.iso))}, the ${c.dec}s`,c.why)).join('')}${row('data-w="surprise"','shuffle','Surprise me','A random place and moment')}</div>
    <p class="wskip"><button type="button" class="dlkb" data-w="skip">Look around on my own</button></p>`);
  b.onclick=e=>{ const t=e.target.closest('[data-w]'); if(!t) return; mark(); UI.sheet.close('detail'); const w=t.dataset.w;
    if(w==='skip'){ try{ window.TRACK&&window.TRACK('welcome',{to:'skip'}); }catch(_){} return; }
    setTimeout(()=>{ if(w==='surprise'){ if(curView()!=='map') location.hash='map'; setTimeout(()=>{ const x=document.getElementById('rolltp'); if(x) x.click(); STTAB='songs'; setTimeout(()=>coach(1),400); try{ window.TRACK&&window.TRACK('welcome',{to:'surprise'}); }catch(_){} },350); }
      else { const c=C[+w]; if(c) go(c.iso,c.dec); } },300); }; }
window.WELCOME={ show, hold, tab(t){ if(step===2&&t==='listen') coach(3); } };
document.addEventListener('click',e=>{ if(step===4&&e.target.closest&&e.target.closest('#whobtn')) coach(0); });
/* Shown once per device: straight away to a signed-in person (signing in offers the walkthrough), and to a visitor without
   an account when they leave the landing page by "Explore without an account" (the landing page calls show()). */
const asked=/[?&]welcome=1\b/.test(location.search), linked=/[?&](p|y|g|pl|sel|v|invite)=/.test(location.search);
setTimeout(()=>{ try{ if(asked){ show(); return; } if(seen()||linked||navigator.webdriver||(window.LANDING&&window.LANDING.up)) return;
    const start=()=>{ if(!seen()&&window.ACCOUNT&&window.ACCOUNT.user&&window.ACCOUNT.user()) show(); };
    start(); if(window.ACCOUNT&&window.ACCOUNT.onChange) window.ACCOUNT.onChange(()=>{ if(!document.getElementById('sheet-detail')||UI.sheet.current()!=='detail') start(); });
  }catch(e){ console.error('welcome',e); } },900);
