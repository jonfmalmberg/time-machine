const MEM={}; const LS={ get(k,d){ try{ const v=localStorage.getItem(k); if(v!=null) return JSON.parse(v); }catch(e){} return k in MEM?JSON.parse(MEM[k]):d; }, set(k,v){ MEM[k]=JSON.stringify(v); try{ localStorage.setItem(k,MEM[k]); }catch(e){} } };
let PPL=LS.get('wmft-people',{list:[],cur:null});
if(!PPL||!Array.isArray(PPL.list)) PPL={list:[],cur:null};
const DBP={}, DBH={};                       // people and history rows seen in the shared database
let dbOK=null;                              // null unknown, true wrote once, false refused
const subs=[];
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const me=()=>PPL.list.find(p=>p.id===PPL.cur)||null;
const isGuest=()=>!me();
let ownerFlag=false;
const isAdmin=()=>{ const m=me(); return !!m&&(!!m.admin||ownerFlag); };   // a guest never sees admin, whoever owns the page
const hkey=id=>'wmft-hist-'+id;
const hist=(id=PPL.cur)=>id?LS.get(hkey(id),[]):[];
const saveP=()=>LS.set('wmft-people',PPL);
const fire=()=>{ subs.forEach(f=>{ try{ f(); }catch(e){} }); paintWho(); if(typeof curView==='function'&&curView()==='me'){ if(typeof soft==='function') soft(); } };
async function pinHash(pid,pin){ const s='wmft:'+pid+':'+pin;
  try{ const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)); return [...new Uint8Array(b)].slice(0,8).map(x=>x.toString(16).padStart(2,'0')).join(''); }
  catch(e){ let h=5381; for(let i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))|0; return 'x'+(h>>>0).toString(16); } }
async function dbw(fn){ if(!DB) return false; try{ await fn(); dbOK=true; return true; }catch(e){ if(dbOK==null) dbOK=false; return false; } }
function putEntry(pid,e){ const L=hist(pid), i=L.findIndex(x=>x.id===e.id); if(i>=0) L[i]=e; else L.push(e); LS.set(hkey(pid),L);
  dbw(()=>DB.collection('hist').doc(e.id).set({who:pid,...e})); }
function add(e){ const m=me(); if(!m) return null;
  const L=hist(), now=Date.now();
  // the same destination copied again within a day is one trip
  const same=L.find(x=>x.kind===e.kind&&x.key===e.key&&now-x.at<864e5&&x.status==='copied');
  if(same){ same.at=now; same.n=(same.n||1)+1; putEntry(m.id,same); fire(); return same; }
  const row={id:uid(),at:now,upd:now,status:'copied',...e}; putEntry(m.id,row); fire(); return row; }
function setStatus(id,st){ const m=me(); if(!m) return; const e=hist().find(x=>x.id===id); if(!e) return; e.status=st; e.upd=Date.now(); putEntry(m.id,e); fire(); }
function setField(id,o){ const m=me(); if(!m) return; const e=hist().find(x=>x.id===id); if(!e) return; Object.assign(e,o); e.upd=Date.now(); putEntry(m.id,e); fire(); }
function setNote(id,t){ const m=me(); if(!m) return; const e=hist().find(x=>x.id===id); if(!e) return; e.note=String(t).slice(0,200); e.upd=Date.now(); putEntry(m.id,e); }
function removeEntry(id){ const m=me(); if(!m) return; LS.set(hkey(m.id),hist().filter(x=>x.id!==id)); delete DBH[id]; dbw(()=>DB.collection('hist').doc(id).delete()); fire(); }
const went=e=>e.status!=='never';
const heardGenres=()=>new Set(hist().filter(e=>e.kind==='genre'&&went(e)&&e.gid).map(e=>e.gid));
const travelled=()=>new Set(hist().filter(e=>e.kind==='trip'&&went(e)&&e.iso&&e.year>=1900).map(e=>e.iso+'_'+Math.floor(e.year/10)*10));
// liking: +1 stayed or loved, -1 left early; used by journeys to lean toward what this person enjoys
function taste(){ const reg={}, band={}; hist().forEach(e=>{ let w=e.status==='loved'?2:e.status==='listened'?1:e.status==='left'?-1.5:0; if(e.rating) w+=(e.rating-5.5)/3; if(!w) return;
    if(e.reg) reg[e.reg]=(reg[e.reg]||0)+w; if(e.gid&&byId[e.gid]){ const n=byId[e.gid]; band[n.band]=(band[n.band]||0)+w; reg[n.reg]=(reg[n.reg]||0)+w; } }); return {reg,band}; }

/* capture: every copied prompt becomes a history row for the current person */
const logCopy0=logCopy;
logCopy=async function(kind,info){ const m=me(); let row=null;
  try{ if(m&&kind==='moment') row=add({kind:'trip',key:[info.iso||info.place,info.year,info.span,STFROM,info.mode].join('|'),place:info.place,iso:info.iso||null,reg:info.iso?isoReg(info.iso):(STP&&STP.k==='reg'?STP.reg:null),year:info.year,span:info.span,from:STFROM,when:info.when,mode:info.mode,pl:STP?{...STP}:null});
    else if(m&&kind==='genre'&&info.id&&byId[info.id]) row=add({kind:'genre',key:info.id,gid:info.id,place:byId[info.id].place,reg:byId[info.id].reg,year:byId[info.id].year});
    else if(m&&kind==='journey') row=add({kind:info.gid?'genre':'trip',...info}); }catch(e){}
  return logCopy0(kind,{...info,who:m?m.id:'guest',whoName:m?m.name:'Guest',hid:row?row.id:null}); };

/* people */
async function createPerson(name,pin){ name=String(name||'').trim().slice(0,24); if(!name) return 'Give a name.';
  if(PPL.list.some(p=>p.name.toLowerCase()===name.toLowerCase())||Object.values(DBP).some(p=>p.name.toLowerCase()===name.toLowerCase())) return 'That name is taken: pick it from the list.';
  const id=uid(), first=!PPL.list.length&&!Object.keys(DBP).length;
  const p={id,name,pin:pin?await pinHash(id,pin):null,admin:first||ownerFlag,at:Date.now()};
  PPL.list.push(p); PPL.cur=id; saveP(); dbw(()=>DB.collection('people').doc(id).set(p));
  // the ticks made before there were people belong to the first person
  if(first&&typeof DONE!=='undefined'&&DONE.size){ const L=[...DONE].filter(g=>byId[g]).map(g=>({id:uid(),at:0,upd:Date.now(),status:'listened',kind:'genre',key:g,gid:g,place:byId[g].place,reg:byId[g].reg,year:byId[g].year,old:1})); LS.set(hkey(id),L); }
  fire(); return null; }
async function signIn(id,pin){ let p=PPL.list.find(x=>x.id===id); const remote=DBP[id];
  if(!p&&remote){ p={...remote}; }
  if(!p) return 'Not found.';
  if(p.pin){ if(!pin) return 'PIN needed.'; if(await pinHash(id,pin)!==p.pin) return 'Wrong PIN.'; }
  if(!PPL.list.some(x=>x.id===id)) PPL.list.push(p);
  PPL.cur=id; saveP(); mergeRemote(); fire(); return null; }
function signOut(){ PPL.cur=null; saveP(); fire(); }
function mergeRemote(){ const m=me(); if(!m) return; const L=hist(); let ch=false;
  Object.values(DBH).forEach(r=>{ if(r.who!==m.id) return; const i=L.findIndex(x=>x.id===r.id); const {who,...e}=r;
    if(i<0){ L.push(e); ch=true; } else if((e.upd||0)>(L[i].upd||0)){ L[i]=e; ch=true; } });
  if(ch) LS.set(hkey(m.id),L); }
function startDb(){ let n=0; const t=setInterval(()=>{ n++;
    if(USERCAP&&!ownerFlag){ try{ Promise.resolve(USERCAP.isOwner()).then(v=>{ if(v){ ownerFlag=true; fire(); } }); }catch(e){} }
    if(!DB){ if(n>40) clearInterval(t); return; } clearInterval(t);
    try{ DB.collection('people').onSnapshot(s=>{ s.docs.forEach(d=>{ const v=d.data(); if(v&&v.name) DBP[d.id]={...v,id:d.id}; }); PPL.list.forEach(p=>{ const r=DBP[p.id]; if(r){ p.admin=!!r.admin; } }); saveP(); fire(); },()=>{}); }catch(e){}
    try{ DB.collection('hist').onSnapshot(s=>{ for(const k in DBH) delete DBH[k]; s.docs.forEach(d=>{ const v=d.data(); if(v&&v.who) DBH[d.id]={...v,id:d.id}; }); mergeRemote(); if(curView()==='me') render(); },()=>{}); }catch(e){}
  },300); }

/* who button */
const whoBtn=document.getElementById('whobtn'), whoPop=document.getElementById('whopop');
function paintWho(){ const m=me(); whoBtn.innerHTML=m?esc(m.name.trim().slice(0,1).toUpperCase()):UI.ic('person'); whoBtn.classList.toggle('guest',!m); whoBtn.title=m?m.name+': your trips are kept under this name':'Guest: nothing is kept'; }
function allPeople(){ const m=new Map(); PPL.list.forEach(p=>m.set(p.id,p)); Object.values(DBP).forEach(p=>{ if(!m.has(p.id)) m.set(p.id,p); }); return [...m.values()].sort((a,b)=>a.name.localeCompare(b.name)); }
const pRow=(pid,name,sub,on)=>`<button type="button" class="rowb" data-pid="${pid}" aria-pressed="${on}"><span class="rmedia"><span class="avatar sm${pid?'':' guest'}">${pid?name.slice(0,1).toUpperCase():UI.ic('person')}</span></span><span class="rmain"><b>${name}</b>${sub?`<small>${sub}</small>`:''}</span><span class="rcheck">${on?'✓':''}</span></button>`;
function paintPop(msg){ const cur=PPL.cur;
  whoPop.innerHTML=`<div class="rows wholist">${allPeople().map(p=>pRow(p.id,esc(p.name),[p.pin?'PIN':'',p.admin&&isAdmin()?'admin':''].filter(Boolean).join(' · '),p.id===cur)).join('')}${pRow('','Guest','Nothing is kept',!cur)}</div>
  <div class="formrow" id="whopin" hidden><input id="whopinv" type="password" inputmode="numeric" maxlength="8" placeholder="PIN" aria-label="PIN"><button class="lbtn primary" id="whopingo" type="button">Enter</button></div>
  <p class="shlabel">New person</p>
  <div class="formrow"><input id="whoname" type="text" maxlength="24" placeholder="Name" aria-label="Name"><input id="whonpin" type="password" inputmode="numeric" maxlength="8" placeholder="PIN (optional)" aria-label="Optional PIN"><button class="lbtn primary" id="whoadd" type="button">Add</button></div>
  <p class="fine" id="whomsg">${esc(msg||'')}</p><p class="fine">Nothing sensitive is stored: a name, an optional short PIN and where you went. ${DB?(dbOK===false?'This view cannot write to the shared log, so your history stays on this device.':'History is also kept in the shared log so an admin can see it.'):'History is kept on this device only.'}</p>`;
  let pending=null;
  whoPop.querySelectorAll('[data-pid]').forEach(b=>b.onclick=async()=>{ const id=b.dataset.pid; if(!id){ signOut(); closePop2(); return; }
    const p=allPeople().find(x=>x.id===id); if(p&&p.pin){ pending=id; const w=whoPop.querySelector('#whopin'); w.hidden=false; const f=w.querySelector('input'); f.placeholder='PIN for '+p.name; f.focus(); return; }
    const err=await signIn(id); if(err) paintPop(err); else closePop2(); });
  const go=async()=>{ if(!pending) return; const err=await signIn(pending,whoPop.querySelector('#whopinv').value); if(err) whoPop.querySelector('#whomsg').textContent=err; else closePop2(); };
  whoPop.querySelector('#whopingo').onclick=go; whoPop.querySelector('#whopinv').onkeydown=e=>{ if(e.key==='Enter') go(); };
  const addP=async()=>{ const err=await createPerson(whoPop.querySelector('#whoname').value,whoPop.querySelector('#whonpin').value); if(err) whoPop.querySelector('#whomsg').textContent=err; else closePop2(); };
  whoPop.querySelector('#whoadd').onclick=addP; whoPop.querySelector('#whoname').onkeydown=e=>{ if(e.key==='Enter') addP(); };
}
function closePop2(){ UI.sheet.close('who'); }
function openWho(){ paintPop(); UI.sheet.open('who'); }
whoBtn.addEventListener('click',openWho);

/* My travels: a windowed list (any length), quick marks on each row, swipe to cancel a ticket, details in a sheet */
const ic=UI.ic;
const STAT={copied:['ticket','Ticket bought'],listened:['check','Went and stayed'],loved:['heart','Loved it'],left:['exit','Left early'],never:['x','Never boarded']};
const REACT=[['love','😍','Love'],['joy','😊','Happy'],['dance','🕺','Danced'],['wow','😮','Surprised'],['moved','🥹','Moved'],['calm','😌','Calm'],['hmm','🤔','Confused'],['bored','😴','Bored'],['fire','🔥','Fire']];
const rEmo=k=>{ const r=REACT.find(x=>x[0]===k); return r?r[1]:''; };
const fmtD=t=>t?new Date(t).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}):'Earlier';
const eTitle=e=>{ if(e.kind==='genre'){ const n=byId[e.gid]; return n?n.name:e.gid; } return e.place||''; };
const eSub=e=>e.kind==='genre'?('Genre'+(byId[e.gid]?' · '+byId[e.gid].place:'')):`${e.when||e.year||''} · ${e.mode==='home'?'made there':'heard there'}${e.n>1?' · ×'+e.n:''}`;
function goAgain(e){ UI.sheet.close(); if(e.kind==='genre'){ if(byId[e.gid]){ select(e.gid); location.hash='list'; } return; }
  resetFilters('all'); setYear(e.year||T1); if(e.from!=null) setStay('from',e.from); else setStay(e.span||0);
  if(e.pl) setPlace(e.pl); else if(e.iso) setPlace({k:'cty',iso:e.iso}); else stApply();
  PMODE=e.mode==='home'?'home':'heard'; stPanelOpen=true; location.hash='map'; stApply(); }
let meFilter='all', page='me', ROWS=[], LIST=null, adminWho=null, ALIST=null, AROWS=[];
function myRows(){ const L=hist().slice().sort((a,b)=>b.at-a.at); return L.filter(e=>meFilter==='all'||(meFilter==='copied'?e.status==='copied':e.kind===meFilter)); }
const act=(e,st)=>`<button type="button" class="tact${e.status===st?' on':''} a-${st}" data-st="${st}" aria-pressed="${e.status===st}" aria-label="${STAT[st][1]}" title="${STAT[st][1]}">${ic(STAT[st][0])}</button>`;
function tripRow(e,edit){ const meta=[fmtD(e.at),eSub(e)].join(' · ');
  return `<div class="trip st-${e.status}" data-hid="${e.id}">${edit?`<div class="sw-under">${ic('x')}<span>${e.status==='never'?'Ticket back':'Never boarded'}</span></div>`:''}
    <div class="sw-in"><span class="tkind k-${e.kind}">${ic(e.kind==='genre'?'note':'pin')}</span><span class="rmain"><b>${esc(eTitle(e))}</b><small>${esc(meta)}</small></span>
    <span class="tbadges">${e.react?`<span class="temo">${rEmo(e.react)}</span>`:''}${e.rating?`<span class="trate">${e.rating}</span>`:''}${e.note?`<span class="tnotei" title="Has a note">✎</span>`:''}</span>
    ${edit?`<span class="tacts">${e.status==='never'?`<span class="tnever">Never boarded</span>`:act(e,'listened')+act(e,'loved')+act(e,'left')}</span>`:`<span class="tstat">${ic(STAT[e.status]?STAT[e.status][0]:'ticket')}</span>`}</div></div>`; }
function statsHtml(){ const L=hist(), trips=L.filter(e=>e.kind==='trip'&&went(e)), cs=new Set(trips.map(e=>e.iso).filter(Boolean)), rated=L.filter(e=>e.rating);
  const cell=(n,l)=>`<span class="stat"><b>${n}</b><small>${l}</small></span>`;
  return cell(trips.length,'trips')+cell(cs.size,'countries')+cell(L.filter(e=>e.kind==='genre'&&went(e)).length,'genres')+cell(L.filter(e=>e.status==='loved').length,'loved')+cell(rated.length?(rated.reduce((s,e)=>s+e.rating,0)/rated.length).toFixed(1):'–','avg rating'); }
function openTrip(id){ const e=hist().find(x=>x.id===id); if(!e) return;
  const b=UI.detail(eTitle(e),`<p class="fine dsub">${esc(fmtD(e.at)+' · '+eSub(e))}</p>
    <p class="shlabel">What happened</p><div class="statgrid">${Object.keys(STAT).map(k=>`<button type="button" class="statb${e.status===k?' on':''} a-${k}" data-st="${k}" aria-pressed="${e.status===k}">${ic(STAT[k][0])}<span>${STAT[k][1]}</span></button>`).join('')}</div>
    <p class="shlabel">How it felt</p><div class="reacts">${REACT.map(([k,em,l])=>`<button type="button" class="reactb${e.react===k?' on':''}" data-re="${k}" aria-pressed="${e.react===k}" aria-label="${l}" title="${l}">${em}</button>`).join('')}</div>
    <p class="shlabel">Rating</p><div class="rates">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button type="button" class="rateb${e.rating===n?' on':''}${e.rating&&n<e.rating?' lo':''}" data-ra="${n}" aria-pressed="${e.rating===n}" aria-label="${n} out of 10">${n}</button>`).join('')}</div>
    <p class="shlabel">Note</p><textarea id="tnote" class="tnotef" rows="3" maxlength="300" placeholder="What stuck with you?">${esc(e.note||'')}</textarea>
    <div class="formrow"><button type="button" class="lbtn primary" data-again>Go again</button><button type="button" class="lbtn danger" data-rm>Remove from history</button></div>`);
  b.onclick=ev=>{ const x=ev.target.closest('button'); if(!x) return; const d=x.dataset;
    if(d.st){ setStatus(id,e.status===d.st&&d.st!=='copied'?'copied':d.st); openTrip(id); }
    else if(d.re){ setField(id,{react:e.react===d.re?null:d.re}); openTrip(id); }
    else if(d.ra){ setField(id,{rating:e.rating===+d.ra?null:+d.ra}); openTrip(id); }
    else if('again' in d) goAgain(e);
    else if('rm' in d){ if(x.dataset.sure){ removeEntry(id); UI.sheet.close(); } else { x.dataset.sure=1; x.textContent='Tap again to remove'; } } };
  const tn=b.querySelector('#tnote'); tn.onchange=()=>setField(id,{note:tn.value.slice(0,300)}); }
function soft(){ const box=document.getElementById('view-me'); if(!box||!box.querySelector('#melist')||page!=='me'||!me()){ render(); return; }
  ROWS=myRows(); const st=box.querySelector('#mestats'); if(st) st.innerHTML=statsHtml(); const em=box.querySelector('#meempty'); if(em) em.hidden=ROWS.length>0; if(LIST) LIST.refresh(); }
function render(){ const box=document.getElementById('view-me'); if(!box) return; const m=me(), adm=isAdmin(); if(!adm) page='me'; let h='';
  if(adm) h+=`<div class="seg mepage" role="radiogroup" aria-label="Page">${[['me','My travels'],['admin','Admin']].map(([v,l])=>`<button type="button" role="radio" data-page="${v}" aria-pressed="${page===v}" aria-checked="${page===v}">${l}</button>`).join('')}</div>`;
  if(page==='admin'&&adm) h+=adminHtml();
  else if(!m) h+=`<div class="meguest"><span class="avatar guest big">${ic('person')}</span><h2>Travelling as Guest</h2><p>Nothing is kept. Choose or add a person to keep a log of where you went, rate it, and get random picks and journeys that skip what you already heard.</p><button class="lbtn primary" id="mewho" type="button">Choose a person</button></div>`;
  else h+=`<div class="mehead"><div class="mestats" id="mestats">${statsHtml()}</div>
      <div class="seg" id="meseg" role="group" aria-label="Show">${[['all','All'],['trip','Trips'],['genre','Genres'],['copied','To review']].map(([v,l])=>`<button type="button" data-mf="${v}" aria-pressed="${meFilter===v}">${l}</button>`).join('')}</div>
      <p class="fine mehint">Copying a prompt buys the ticket. Mark what happened with ${ic('check')} ${ic('heart')} ${ic('exit')}, swipe a row right if you never boarded, tap it for reactions, a rating and notes.</p></div>
    <div id="melist" class="triplist"></div><p class="fine" id="meempty" hidden>Nothing here yet. Copy a playlist prompt anywhere in the app and it shows up here.</p>`;
  box.innerHTML=h; LIST=null; ALIST=null;
  box.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{ page=b.dataset.page; render(); });
  const w=box.querySelector('#mewho'); if(w) w.onclick=e=>{ e.stopPropagation(); openWho(); };
  box.querySelectorAll('[data-mf]').forEach(b=>b.onclick=()=>{ meFilter=b.dataset.mf; box.querySelectorAll('[data-mf]').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); soft(); });
  const host=box.querySelector('#melist');
  if(host){ ROWS=myRows(); box.querySelector('#meempty').hidden=ROWS.length>0; LIST=UI.vlist(host,{rowH:66,count:()=>ROWS.length,row:i=>tripRow(ROWS[i],true)});
    host.onclick=ev=>{ const row=ev.target.closest('.trip'); if(!row) return; const id=row.dataset.hid, e=hist().find(x=>x.id===id); if(!e) return; const a=ev.target.closest('.tact');
      if(a){ setStatus(id,e.status===a.dataset.st?'copied':a.dataset.st); return; } openTrip(id); };
    UI.swipe(host,{onSwipe:(row,i)=>{ const e=ROWS[i]; if(e) setStatus(e.id,e.status==='never'?'copied':'never'); }}); }
  if(page==='admin'&&adm) wireAdmin(box); }
function unreviewed(){ const out=[]; for(const iso in YEARL) for(const y in YEARL[iso]){ const c=YEARL[iso][y]; if(c&&c.status==='unreviewed') out.push({iso,y:+y,n:(c.songs||[]).length,by:c.by||'',at:c.at||0}); } return out.sort((a,b)=>a.iso.localeCompare(b.iso)||a.y-b.y); }
function adminHtml(){ let h=`<div class="meadmin">`;
  const U=unreviewed(), groups={}; U.forEach(u=>{ const k=u.iso+'_'+Math.floor(u.y/10)*10; (groups[k]=groups[k]||[]).push(u); });
  h+=`<h3>New research, not yet listener-tested</h3>`+(Object.keys(groups).length?`<p class="fine">These lists are live and marked "new research, not yet tested" where they are used. Test them from the map (Playlist for this moment → Test with a synthetic listener), then keep or remove them here.</p>`+Object.entries(groups).map(([k,L])=>`<div class="trow" data-ur="${k}"><span class="twhat"><b>${esc(isoName(L[0].iso))} ${k.slice(3)}s</b> <span class="fine">${L.length} years · ${L.reduce((s,u)=>s+u.n,0)} songs${L[0].by?' · by '+esc(L[0].by):''}${L[0].at?' · '+fmtD(L[0].at):''}</span></span><button class="lbtn urgo" type="button">Open</button><button class="lbtn urok" type="button">Mark tested</button><button class="lbtn urdel" type="button">Remove</button></div>`).join(''):`<p class="fine">${DB?'None waiting.':'The shared database is not reachable in this view, so new research cannot be listed here.'}</p>`);
  const by={}; Object.values(DBH).forEach(r=>{ (by[r.who]=by[r.who]||[]).push(r); });
  h+=`<h3>Everyone's travels</h3>`;
  const ids=Object.keys(by).sort((a,b)=>by[b].length-by[a].length); if(!ids.includes(adminWho)) adminWho=ids[0]||null;
  if(!ids.length) h+=`<p class="fine">${DB?'No history has reached the shared log yet.':'Only histories that reach the shared log can be shown, and it is not reachable in this view.'}</p>`;
  else{ AROWS=by[adminWho].slice().sort((a,b)=>b.at-a.at);
    h+=`<div class="seg" id="adwho" role="group" aria-label="Person">${ids.map(pid=>{ const p=DBP[pid]||PPL.list.find(x=>x.id===pid)||{name:pid}; return `<button type="button" data-aw="${pid}" aria-pressed="${pid===adminWho}">${esc(p.name)} · ${by[pid].length}</button>`; }).join('')}</div><div id="adlist" class="triplist"></div>`; }
  const others=allPeople().filter(p=>p.id!==PPL.cur);
  if(others.length) h+=`<h3>People</h3>`+others.map(p=>`<div class="trow" data-pp="${p.id}"><span class="twhat"><b>${esc(p.name)}</b> <span class="fine">${p.pin?'has a PIN':'no PIN'}${p.admin?' · admin':''}</span></span><button class="lbtn ppadm" type="button">${p.admin?'Remove admin':'Make admin'}</button><button class="lbtn pppin" type="button">Clear PIN</button></div>`).join('');
  return h+`</div>`; }
function wireAdmin(box){
  box.querySelectorAll('[data-aw]').forEach(b=>b.onclick=()=>{ adminWho=b.dataset.aw; render(); });
  const ah=box.querySelector('#adlist'); if(ah) ALIST=UI.vlist(ah,{rowH:60,count:()=>AROWS.length,row:i=>tripRow(AROWS[i],false)});
  box.querySelectorAll('[data-ur]').forEach(r=>{ const k=r.dataset.ur, iso=k.slice(0,2), dec=+k.slice(3), ys=unreviewed().filter(u=>u.iso===iso&&Math.floor(u.y/10)*10===dec);
    r.querySelector('.urgo').onclick=()=>{ resetFilters('all'); setYear(ys[0].y); setStay(0); stPanelOpen=true; setPlace({k:'cty',iso}); location.hash='map'; };
    r.querySelector('.urok').onclick=async()=>{ for(const u of ys){ YEARL[iso][u.y].status='verified'; await dbw(()=>DB.collection('year').doc(iso+'_'+u.y).update({status:'verified',reviewedAt:Date.now(),reviewedBy:(me()||{}).name||'admin'})); } render(); };
    const d=r.querySelector('.urdel'); d.onclick=async()=>{ if(!d.dataset.sure){ d.dataset.sure=1; d.textContent='Sure?'; return; } for(const u of ys){ delete YEARL[iso][u.y]; await dbw(()=>DB.collection('year').doc(iso+'_'+u.y).delete()); } render(); stPanelUpdate(); }; });
  box.querySelectorAll('[data-pp]').forEach(r=>{ const id=r.dataset.pp, p=allPeople().find(x=>x.id===id); if(!p) return;
    r.querySelector('.ppadm').onclick=()=>{ p.admin=!p.admin; const l=PPL.list.find(x=>x.id===id); if(l) l.admin=p.admin; saveP(); dbw(()=>DB.collection('people').doc(id).update({admin:p.admin})); render(); };
    r.querySelector('.pppin').onclick=()=>{ p.pin=null; const l=PPL.list.find(x=>x.id===id); if(l) l.pin=null; saveP(); dbw(()=>DB.collection('people').doc(id).update({pin:null})); render(); }; }); }

window.PEOPLE={ me, isGuest, isAdmin, history:()=>hist(), heardGenres, travelled, taste, add, setStatus, setField, remove:removeEntry, onChange:f=>subs.push(f), render, unreviewed };
VIEWHOOK.me=render;
paintWho(); startDb(); if(curView()==='me') render();

/* label lists that came from new research and have not been listener-tested */
const stPanelUpdate0=stPanelUpdate;
stPanelUpdate=function(){ stPanelUpdate0.apply(this,arguments);
  try{ const iso=placeIso(), el=document.getElementById('stsrc'); if(!iso||!el||!YEARL[iso]) return; const [a,b]=stRange(); let u=false;
    for(let y=Math.max(a,1900);y<=b;y++){ const c=YEARL[iso][y]; if(c&&c.status==='unreviewed'){ u=true; break; } }
    if(u) el.insertAdjacentHTML('beforeend',' <b class="unrev">New research, not yet tested with a listener.</b>'); }catch(e){} };
