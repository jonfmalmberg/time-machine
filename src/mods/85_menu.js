/* Top-bar actions: full-screen search, random action sheet, about sheet. */
const ic=UI.ic, res=document.getElementById('msres'), sq=document.getElementById('msq'), rp=document.getElementById('mrand'), ov=document.getElementById('searchov');
const key=document.querySelector('.keyline'), hk=document.getElementById('helpkey'); if(key&&hk){ key.classList.add('inhelp'); hk.appendChild(key); }
const norm=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const row=(attr,media,title,sub)=>`<button type="button" class="rowb" ${attr}><span class="rmedia">${media}</span><span class="rmain"><b>${title}</b>${sub?`<small>${sub}</small>`:''}</span></button>`;
const dot=c=>`<i class="mdot" style="background:${c}"></i>`;
/* about */
function aboutHtml(v){ let cd=0, cc=0; try{ for(const iso in YEARL){ const d=new Set(Object.keys(YEARL[iso]).map(y=>Math.floor(+y/10))); cd+=d.size; } }catch(e){} try{ cc=Object.keys(ERA).length; }catch(e){}
  const note=document.querySelector(v==='map'?'.mapnote':v==='tunnel'?'.tunnote':'#nothing');
  const views=[['tree','Tree','Every movement on a timeline, grouped by sound and joined to what it grew from. Pinch or scroll to zoom.'],['globe','Map','Where each sound was born. Tap a country or city to go there.'],['tunnel','Tunnel','The same history as a flight through time: stars are movements, galaxies are traditions.'],['list','List','Each movement explained, with example tracks and a ready prompt.'],['route','Journey','Ordered walks: follow a life from place to place, take a music-history course, or travel the world region by region.'],['table','Data','Look up the songs, sources, movements, places and artists behind everything.'],['person','Me','Where you have been, and what you thought of it.']];
  return `<p class="ablead">Hear what people really listened to in a place and a time. Pick somewhere and some year, and the Time Machine writes a prompt for Spotify's AI playlist that takes you there.</p>
  <h3>How to use it</h3>
  <ol class="absteps"><li><b>Choose where and when.</b> The three filters at the top set the place, the time and, if you like, a genre.</li><li><b>Tap ${ic('note')} for the playlist.</b> You get a prompt with seed songs from that place and time. Copy it.</li><li><b>Paste it into Spotify.</b> Create, then AI playlist, then paste.</li></ol>
  <p class="fine">In a hurry? ${ic('shuffle')} picks a random genre or teleports you somewhere.</p>
  <h3>The views</h3>
  <div class="rows abrows">${views.map(([i,l,d])=>`<div class="rowb abrow"><span class="rmedia">${ic(i)}</span><span class="rmain"><b>${l}</b><small>${d}</small></span></div>`).join('')}</div>
  <h3>Where the songs come from</h3>
  <p>The tree holds ${N.length} movements in ${Object.keys(TRADM).length} traditions. Seed songs come from three places, best first: published year-end charts (${cd} country-decades so far), researched decade lists (${cc} countries), and hand-picked example tracks for each genre.</p>
  <p>Each prompt says which of these it used. Where a place and time has no song list yet, the prompt falls back on the genres alive there and says so; you can ask for research from the playlist sheet. New research arrives weekly and is marked untested until a listener test has checked it.</p>
  <h3>Your travels</h3>
  <p>Testers sign in with Google from the round button at the top right. Every prompt a tester copies is logged under Account: mark each trip as stayed, loved, left early or never boarded, and random picks and journeys then skip what you have heard and lean toward what you liked. A tester's account keeps a handle, that log with its ratings and notes, and which parts of the app they use.</p><p>Without an account nothing is kept about you. To help decide what to build next, the site records what visitors do in it (views opened, places and years chosen, prompts copied) with no name, address or device identifier, and not at all if your browser asks not to be tracked.</p>
  ${note?`<h3>This view</h3><p>${note.innerHTML}</p>`:''}${v==='tree'?'<h3>Reading the tree</h3>':''}`; }
document.getElementById('helpbtn').addEventListener('click',()=>{ const v=curView(); document.getElementById('helpnote').innerHTML=aboutHtml(v); document.getElementById('helpkey').hidden=v!=='tree';
  ['sub','method'].forEach(id=>{ const e=document.getElementById(id); if(e) e.hidden=true; }); const t=document.querySelector('#sheet-help .sheet-head b'); if(t) t.textContent='World Music Time Machine'; UI.sheet.open('help'); });
/* random */
rp.innerHTML=[['rollany','shuffle','Random genre','Within the current filters'],['rollnew','note','A genre I have not heard','Skips what you already heard'],['rolltp','bolt','Teleport','A random place and moment'],['rolltpnew','pin','Somewhere new','A place and time you have not been']].map(([id,i,l,d])=>row(`data-go="${id}"`,ic(i),l,d)).join('');
document.getElementById('mrandb').addEventListener('click',()=>UI.sheet.open('rand'));
rp.addEventListener('click',e=>{ const b=e.target.closest('[data-go]'); if(!b) return; const id=b.dataset.go, trav=['tree','map','tunnel'].includes(curView()); UI.sheet.close('rand');
  if((id==='rolltp'||id==='rolltpnew')&&!trav){ location.hash='map'; setTimeout(()=>document.getElementById(id).click(),350); } else document.getElementById(id).click(); });
/* search */
let ART=null;
function artists(){ if(ART) return ART; const m=new Map(), add=a=>{ const k=norm(a); if(!k) return; let o=m.get(k); if(!o){ o={name:a,n:0}; m.set(k,o); } o.n++; };
  try{ for(const iso in YEARL) for(const y in YEARL[iso]) (YEARL[iso][y].songs||[]).forEach(s=>add(s[0])); }catch(e){}
  try{ N.forEach(n=>{ const p=PL[n.id]; if(!p) return; [...(p.intro||[]),...(p.peak||[])].forEach(s=>add(s[0])); }); }catch(e){}
  ART=[...m.values()]; return ART; }
function paintRes(){ const s=norm(sq.value.trim()); if(s.length<2){ res.innerHTML=''; res.hidden=true; return; }
  const out=[], st=(a,b)=>(norm(a).startsWith(s)?0:1)-(norm(b).startsWith(s)?0:1), k=x=>`data-k="${x}"`;
  N.filter(n=>norm(n.name).includes(s)).sort((a,b)=>st(a.name,b.name)||a.name.localeCompare(b.name)).slice(0,8).forEach(n=>out.push(row(k('g:'+n.id),dot(regColor(n.reg)),esc(n.name),'Genre · '+esc(n.place)+', '+fmtY(n.year))));
  Object.keys(TRADM).filter(t=>TRADM[t].length>1&&norm(TRADN[t]||'').includes(s)).slice(0,3).forEach(t=>out.push(row(k('t:'+t),ic('note'),esc(TRADN[t]),'Tradition · sets the genre filter')));
  REG.forEach(([r,n])=>{ if(norm(n).includes(s)) out.push(row(k('r:'+r),dot(regColor(r)),esc(n),'Continent · sets the place filter')); });
  Object.keys(ISO).filter(i=>norm(isoName(i)).includes(s)).sort((a,b)=>st(isoName(a),isoName(b))).slice(0,5).forEach(i=>out.push(row(k('c:'+i),ic('pin'),esc(isoName(i)),'Country · sets the place filter')));
  CITIES.map((c,i)=>({c,i})).filter(o=>norm(o.c.name).includes(s)).sort((a,b)=>st(a.c.name,b.c.name)||b.c.size-a.c.size).slice(0,5).forEach(o=>out.push(row(k('y:'+o.i),ic('pin'),esc(o.c.name),(o.c.kind==='area'?'Area':'City')+' · '+esc(isoName(o.c.iso2)))));
  artists().filter(a=>norm(a.name).includes(s)).sort((a,b)=>st(a.name,b.name)||b.n-a.n).slice(0,5).forEach(a=>out.push(row(k('a:'+esc(a.name)),ic('person'),esc(a.name),'Artist · '+a.n+' song'+(a.n>1?'s':''))));
  res.hidden=false; res.innerHTML=out.length?out.join(''):'<p class="fine rempty">Nothing found.</p>'; }
function openSearch(){ ov.hidden=false; void ov.offsetHeight; ov.classList.add('in'); sq.value=''; paintRes(); sq.focus(); }
function closeSearch(){ ov.classList.remove('in'); sq.blur(); setTimeout(()=>{ if(!ov.classList.contains('in')) ov.hidden=true; },220); }
document.getElementById('msearchb').addEventListener('click',openSearch);
document.getElementById('mscancel').addEventListener('click',closeSearch);
sq.addEventListener('input',paintRes);
sq.addEventListener('keydown',e=>{ if(e.key==='Enter'){ const b=res.querySelector('[data-k]'); if(b) b.click(); } else if(e.key==='Escape') closeSearch(); });
res.addEventListener('click',e=>{ const b=e.target.closest('[data-k]'); if(!b) return; const k=b.dataset.k, t=k[0], id=k.slice(2), v=curView(); closeSearch();
  if(t==='g'){ select(id); if(['journey','data','me'].includes(v)){ location.hash='list'; setTimeout(()=>goTo(id),300); } else if(v==='list') goTo(id); }
  else if(t==='t'){ FG={k:'trad',id}; stApply(); try{ applyHighlight(); }catch(e){} if(['journey','me'].includes(v)) location.hash='tree'; }
  else if(t==='r'||t==='c'||t==='y'){ setPlace(t==='r'?{k:'reg',reg:id}:t==='c'?{k:'cty',iso:id}:{k:'city',i:+id,iso:CITIES[+id].iso2}); if(['journey','me'].includes(v)) location.hash='map'; }
  else if(t==='a'){ location.hash='data'; setTimeout(()=>{ try{ DATATAB.showArtist(id); }catch(e){} },300); } });
window.MENU={openSearch,closeSearch};
/* each view starts with the filter chips scrolled to the start */
const showView3=showView; showView=function(v){ const r=showView3.apply(this,arguments); try{ const f=document.querySelector('.fpills'); if(f) f.scrollLeft=0; if(v==='list'&&selected) setTimeout(()=>{ try{ goTo(selected); }catch(e){} },60); }catch(e){} return r; };
