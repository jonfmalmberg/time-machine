/* People = accounts. A signed-in, active tester has a travel history kept in the database (table trips)
   with a copy in this browser so the page is instant and survives a dropped connection. Everyone else
   is a guest: nothing is kept. window.PEOPLE keeps the interface the other modules use. */
const MEM={}; const LS={ get(k,d){ try{ const v=localStorage.getItem(k); if(v!=null) return JSON.parse(v); }catch(e){} return k in MEM?JSON.parse(MEM[k]):d; }, set(k,v){ MEM[k]=JSON.stringify(v); try{ localStorage.setItem(k,MEM[k]); }catch(e){} } };
const A=()=>window.ACCOUNT||null, cl=()=>{ const a=A(); return a&&a.client?a.client():null; };
const subs=[];
const uid=()=>{ try{ return crypto.randomUUID(); }catch(e){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{ const r=Math.random()*16|0; return (c==='x'?r:(r&3|8)).toString(16); }); } };
const me=()=>{ const a=A(); if(!a||!a.isActive()) return null; const u=a.user(), p=a.profile(); return u?{id:u.id,name:(p&&p.handle)||'Tester',role:p?p.role:'beta'}:null; };
const isGuest=()=>!me();
const isAdmin=()=>{ const a=A(); return !!(a&&a.isOwner()); };
const hkey=id=>'wmft-trips-'+id, dkey=id=>'wmft-trips-del-'+id;
const hist=()=>{ const m=me(); return m?LS.get(hkey(m.id),[]):[]; };
const fire=()=>{ subs.forEach(f=>{ try{ f(); }catch(e){} }); if(typeof curView==='function'&&curView()==='me') soft(); };

/* ---- pointers: what is stored is a key into the site's data, never a copy of a name ---- */
const cKey=c=>c.iso2+':'+c.name; let CIDX=null;
const cFind=k=>{ if(!CIDX){ CIDX=new Map(); CITIES.forEach((c,i)=>CIDX.set(cKey(c),i)); } return CIDX.has(k)?CIDX.get(k):-1; };
function plOut(p){ if(!p) return null; if(p.k==='city'){ const c=CITIES[p.i]; return c?{k:'city',c:cKey(c),iso:c.iso2}:(p.iso?{k:'cty',iso:p.iso}:null); }
  if(p.k==='multi') return {k:'multi',items:(p.items||[]).map(plOut).filter(Boolean)}; if(p.k==='cty') return {k:'cty',iso:p.iso}; if(p.k==='reg') return {k:'reg',reg:p.reg}; return null; }
function plIn(p){ if(!p||!p.k) return null; if(p.k==='city'){ const i=cFind(p.c); return i>=0?{k:'city',i,iso:CITIES[i].iso2}:(p.iso?{k:'cty',iso:p.iso}:null); }
  if(p.k==='multi'){ const items=(p.items||[]).map(plIn).filter(Boolean); return items.length?{k:'multi',items}:null; } if(p.k==='cty'&&p.iso) return {k:'cty',iso:p.iso}; if(p.k==='reg'&&p.reg) return {k:'reg',reg:p.reg}; return null; }
const plKey=p=>{ const o=plOut(p); if(!o) return ''; return o.k==='city'?'city:'+o.c:o.k==='cty'?'cty:'+o.iso:o.k==='reg'?'reg:'+o.reg:'multi:'+o.items.map(x=>x.c||x.iso||x.reg).join('+'); };
/* the same wording the app uses for a time range, worked out from the stored numbers */
function whenOf(e){ if(e.year==null) return ''; const y=e.year, a=e.from!=null?Math.min(e.from,y):y-(e.span||0), b=e.from!=null?y:Math.min(T1,y+(e.span||0));
  if(a===b) return fmtY(a); if((e.from==null?e.span===5:b===a+9)&&a>=1900&&a%10===0) return `the ${a}s`; return `${fmtY(a)}–${fmtY(b)}`.replace(/ BCE–(\d+) BCE/,'–$1 BCE'); }
const int=v=>v==null||isNaN(v)?null:Math.round(v);
const toDb=e=>({id:e.id,kind:e.kind,key:String(e.key).slice(0,200),place:plOut(e.pl),iso:e.iso||null,reg:e.reg||null,year:int(e.year),span:int(e.span),from_year:int(e.from),mode:e.mode||null,gid:e.gid||null,
  label:(!e.pl&&!e.gid&&!e.iso&&!e.reg)?String(e.place||'').slice(0,80)||null:null,status:e.status,react:e.react||null,rating:e.rating||null,note:e.note?String(e.note).slice(0,300):null,n:e.n||1,
  created_at:new Date(e.at).toISOString(),updated_at:new Date(e.upd||e.at).toISOString()});
function fromDb(r){ const pl=plIn(r.place)||(r.kind==='trip'?(r.iso?{k:'cty',iso:r.iso}:r.reg?{k:'reg',reg:r.reg}:null):null);
  const e={id:r.id,at:Date.parse(r.created_at),upd:Date.parse(r.updated_at),kind:r.kind,key:r.key,pl,iso:r.iso,reg:r.reg,year:r.year,span:r.span,from:r.from_year,mode:r.mode,gid:r.gid,status:r.status,react:r.react,rating:r.rating,note:r.note,n:r.n||1};
  e.place=r.kind==='genre'?(byId[r.gid]?byId[r.gid].place:''):(pl?placeName(pl):(r.label||'Somewhere')); e.when=whenOf(e); return e; }

/* ---- keeping the browser copy and the database in step ---- */
let SYNC='idle';                          /* idle | busy | ok | off */
async function push(e){ const c=cl(); if(!c||!me()) return false; try{ const {error}=await c.from('trips').upsert(toDb(e)); if(error) throw error; return true; }catch(x){ SYNC='off'; return false; } }
async function pushDel(id){ const c=cl(), m=me(); if(!c||!m) return; try{ const {error}=await c.from('trips').delete().eq('id',id); if(error) throw error; LS.set(dkey(m.id),LS.get(dkey(m.id),[]).filter(x=>x!==id)); }catch(x){ SYNC='off'; } }
async function pull(){ const c=cl(), m=me(); if(!c||!m||SYNC==='busy') return; SYNC='busy';
  try{ const {data,error}=await c.from('trips').select('*').eq('user_id',m.id).order('created_at',{ascending:false}).limit(5000); if(error) throw error;
    const gone=new Set(LS.get(dkey(m.id),[])), L=LS.get(hkey(m.id),[]), seen=new Set();
    (data||[]).forEach(r=>{ if(gone.has(r.id)) return; seen.add(r.id); const e=fromDb(r), i=L.findIndex(x=>x.id===e.id); if(i<0) L.push(e); else if((e.upd||0)>=(L[i].upd||0)) L[i]=e; });
    LS.set(hkey(m.id),L); SYNC='ok'; fire();
    /* anything made while offline goes up now; removals that did not reach the database are repeated */
    for(const e of L){ if(!seen.has(e.id)||((data||[]).find(r=>r.id===e.id&&Date.parse(r.updated_at)<(e.upd||0)))) await push(e); }
    for(const id of gone) await pushDel(id);
  }catch(x){ SYNC='off'; } }
function putEntry(e){ const m=me(); if(!m) return; const L=LS.get(hkey(m.id),[]), i=L.findIndex(x=>x.id===e.id); if(i>=0) L[i]=e; else L.push(e); LS.set(hkey(m.id),L); push(e); }
function add(e){ const m=me(); if(!m) return null;
  const L=hist(), now=Date.now();
  // the same destination copied again within a day is one trip
  const same=L.find(x=>x.kind===e.kind&&x.key===e.key&&now-x.at<864e5&&x.status==='copied');
  if(same){ same.upd=now; same.n=(same.n||1)+1; putEntry(same); fire(); return same; }
  const row={id:uid(),at:now,upd:now,status:'copied',n:1,...e}; if(row.when==null) row.when=whenOf(row); putEntry(row); fire(); return row; }
function setStatus(id,st){ if(!me()) return; const e=hist().find(x=>x.id===id); if(!e) return; e.status=st; e.upd=Date.now(); putEntry(e); fire(); }
function setField(id,o){ if(!me()) return; const e=hist().find(x=>x.id===id); if(!e) return; Object.assign(e,o); e.upd=Date.now(); putEntry(e); fire(); }
function removeEntry(id){ const m=me(); if(!m) return; LS.set(hkey(m.id),hist().filter(x=>x.id!==id)); LS.set(dkey(m.id),[...LS.get(dkey(m.id),[]),id]); pushDel(id); fire(); }
const went=e=>e.status!=='never';
const heardGenres=()=>new Set(hist().filter(e=>e.kind==='genre'&&went(e)&&e.gid).map(e=>e.gid));
const travelled=()=>new Set(hist().filter(e=>e.kind==='trip'&&went(e)&&e.iso&&e.year>=1900).map(e=>e.iso+'_'+Math.floor(e.year/10)*10));
// liking: +1 stayed or loved, -1 left early; used by journeys to lean toward what this person enjoys
function taste(){ const reg={}, band={}; hist().forEach(e=>{ let w=e.status==='loved'?2:e.status==='listened'?1:e.status==='left'?-1.5:0; if(e.rating) w+=(e.rating-5.5)/3; if(!w) return;
    if(e.reg) reg[e.reg]=(reg[e.reg]||0)+w; if(e.gid&&byId[e.gid]){ const n=byId[e.gid]; band[n.band]=(band[n.band]||0)+w; reg[n.reg]=(reg[n.reg]||0)+w; } }); return {reg,band}; }

const track=(a,r)=>{ try{ if(window.TRACK) window.TRACK(a,r); }catch(e){} };

/* capture: every copied prompt becomes a trip for the signed-in tester */
const logCopy0=logCopy;
logCopy=async function(kind,info){ const m=me(); let row=null;
  try{ if(m&&kind==='moment'){ const pl=STP?{...STP}:(info.iso?{k:'cty',iso:info.iso}:null);
      row=add({kind:'trip',key:[plKey(pl)||info.place,info.year,info.span,STFROM,info.mode].join('|'),place:info.place,iso:info.iso||null,reg:info.iso?isoReg(info.iso):(STP&&STP.k==='reg'?STP.reg:null),year:info.year,span:info.span,from:STFROM,when:info.when,mode:info.mode,pl}); }
    else if(m&&kind==='genre'&&info.id&&byId[info.id]) row=add({kind:'genre',key:info.id,gid:info.id,place:byId[info.id].place,reg:byId[info.id].reg,year:byId[info.id].year});
    else if(m&&kind==='journey') row=add({kind:info.gid?'genre':'trip',...info});
    }catch(e){}
  track('copy',{kind,gid:info.id||info.gid||null,pl:kind==='genre'?null:(window.PLKEY?window.PLKEY(STP):null),year:int(info.year),span:int(info.span),mode:info.mode||null});
  return logCopy0(kind,{...info,who:m?m.id:'guest',whoName:m?m.name:'Guest',hid:row?row.id:null}); };

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
function soft(){ const box=document.getElementById('view-me'); if(!box) return; if(page==='acct'&&me()&&box.querySelector('#acctbox')) return;   /* the account controls redraw themselves */
  if(!box.querySelector('#melist')||page!=='me'||!me()){ render(); return; }
  ROWS=myRows(); const st=box.querySelector('#mestats'); if(st) st.innerHTML=statsHtml(); const em=box.querySelector('#meempty'); if(em) em.hidden=ROWS.length>0; const sy=box.querySelector('#mesync'); if(sy) sy.hidden=SYNC!=='off'; if(LIST) LIST.refresh(); }
/* The Account page: opened from the round button at the top right (it is not in the tab bar).
   Guests see sign-in; people under review see their status and the invite field; active testers
   get their travels, their account controls and, for the owner, Admin. */
const hero=(cls,icn,title,text)=>`<div class="meguest"><span class="avatar big ${cls}">${ic(icn)}</span><h2>${title}</h2><p>${text}</p></div>`;
function render(){ const box=document.getElementById('view-me'); if(!box) return; const a=A(), m=me(), adm=isAdmin(), signed=!!(a&&a.user()); if(page==='admin'&&!adm) page='me'; let h='';
  if(!m) h+=(signed?'':hero('guest','person','Travelling as a guest','Nothing is kept. Testers sign in to keep a log of where they went, rate it, and get random picks and journeys that skip what they already heard.'))+`<div class="acctbox" id="acctbox"></div>`;
  else{ const pages=[['me','Travels'],['acct','Account']].concat(adm?[['admin','Admin']]:[]);
    h+=`<div class="mewho"><span class="avatar sm">${esc(m.name.slice(0,1).toUpperCase())}</span><span class="rmain"><b>${esc(m.name)}</b><small>${m.role==='owner'?'Owner':m.role==='principal'?'Principal tester':'Beta tester'}</small></span></div>
      <div class="seg mepage" role="radiogroup" aria-label="Page">${pages.map(([v,l])=>`<button type="button" role="radio" data-page="${v}" aria-pressed="${page===v}" aria-checked="${page===v}">${l}</button>`).join('')}</div>`;
    if(page==='admin') h+=adminHtml();
    else if(page==='acct') h+=`<div class="acctbox" id="acctbox"></div>`;
    else h+=`<div class="mehead"><div class="mestats" id="mestats">${statsHtml()}</div>
      <div class="seg" id="meseg" role="group" aria-label="Show">${[['all','All'],['trip','Trips'],['genre','Genres'],['copied','To review']].map(([v,l])=>`<button type="button" data-mf="${v}" aria-pressed="${meFilter===v}">${l}</button>`).join('')}</div>
      <p class="fine mehint">Copying a prompt buys the ticket. Mark what happened with ${ic('check')} ${ic('heart')} ${ic('exit')}, swipe a row right if you never boarded, tap it for reactions, a rating and notes.</p>
      <p class="fine mesync" id="mesync"${SYNC==='off'?'':' hidden'}>Not reaching the database right now. Changes are kept on this device and sent when it is back.</p></div>
    <div id="melist" class="triplist"></div><p class="fine" id="meempty" hidden>Nothing here yet. Copy a playlist prompt anywhere in the app and it shows up here.</p>`; }
  box.innerHTML=h; LIST=null;
  if(a) a.mount(box.querySelector('#acctbox'));
  box.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{ page=b.dataset.page; render(); });
  box.querySelectorAll('[data-mf]').forEach(b=>b.onclick=()=>{ meFilter=b.dataset.mf; box.querySelectorAll('[data-mf]').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); soft(); });
  const host=box.querySelector('#melist');
  if(host){ ROWS=myRows(); box.querySelector('#meempty').hidden=ROWS.length>0; LIST=UI.vlist(host,{rowH:66,count:()=>ROWS.length,row:i=>tripRow(ROWS[i],true)});
    host.onclick=ev=>{ const row=ev.target.closest('.trip'); if(!row) return; const id=row.dataset.hid, e=hist().find(x=>x.id===id); if(!e) return; const t=ev.target.closest('.tact');
      if(t){ setStatus(id,e.status===t.dataset.st?'copied':t.dataset.st); return; } openTrip(id); };
    UI.swipe(host,{onSwipe:(row,i)=>{ const e=ROWS[i]; if(e) setStatus(e.id,e.status==='never'?'copied':'never'); }}); }
  if(page==='admin'&&adm) wireAdmin(box); }
/* the round button opens the Account page; tapping it again goes back to where you were */
let backTo='tree';
const whoBtn=document.getElementById('whobtn');
if(whoBtn) whoBtn.addEventListener('click',()=>{ if(curView()==='me') location.hash=backTo; else{ backTo=curView(); location.hash='me'; } });
function openAccount(){ if(me()) page='acct'; if(curView()!=='me'){ backTo=curView(); location.hash='me'; } else render(); }

/* ---- Admin (owner only): totals, people waiting, every tester and what they did ---- */
let AD={stats:null,people:null,reqs:null,err:'',at:0};
const ROLEN={beta:'Beta tester',principal:'Principal tester',owner:'Owner'};
async function adminLoad(){ const c=cl(); if(!c) return; AD.at=Date.now();
  try{ const [s,p,q]=await Promise.all([c.rpc('admin_stats'),c.from('profiles').select('id,handle,role,status,joined').order('joined',{ascending:false}).limit(1000),
      c.from('requests').select('id,kind,key,ref,n,status,last_at').eq('status','open').order('n',{ascending:false}).limit(100)]);
    if(s.error) throw s.error; if(p.error) throw p.error; AD.stats=s.data; AD.people=p.data||[]; AD.reqs=q.error?null:(q.data||[]); AD.err=''; }
  catch(e){ AD.err=(e&&e.message)||'The admin data could not be read.'; }
  if(curView()==='me'&&page==='admin') render(); }
const pRow=p=>`<button type="button" class="rowb adp" data-ap="${p.id}"><span class="rmedia"><span class="avatar sm${p.status==='active'?'':' guest'}">${p.handle?esc(p.handle.slice(0,1).toUpperCase()):ic('person')}</span></span><span class="rmain"><b>${p.handle?esc(p.handle):'No handle yet'}</b><small>${esc((p.status==='active'?ROLEN[p.role]||p.role:p.status==='pending'?'Waiting':'Suspended')+' · joined '+fmtD(Date.parse(p.joined)))}</small></span>${p.status==='pending'?`<span class="lbtn primary adok" data-ok="${p.id}">Let in</span>`:`<span class="rchev">${ic('chev')}</span>`}</button>`;
function adminHtml(){ if(!AD.people&&!AD.err){ if(Date.now()-AD.at>3000) adminLoad(); return `<p class="fine adwait">Reading…</p>`; }
  if(Date.now()-AD.at>30000) adminLoad();
  const s=AD.stats||{}, P=AD.people||[], mine=me(), wait=P.filter(p=>p.status==='pending'), rest=P.filter(p=>p.status!=='pending'&&(!mine||p.id!==mine.id));
  const cell=(n,l)=>`<span class="stat"><b>${n==null?'–':n}</b><small>${l}</small></span>`;
  return `<div class="meadmin">${AD.err?`<p class="fine acctmsg">${esc(AD.err)}</p>`:''}
    <div class="mestats">${cell(s.active,'testers')}${cell(s.pending,'waiting')}${cell(s.requests,'requests')}${cell(s.trips,'trips')}${cell(s.rated,'rated')}${cell(s.events7,'events, 7 days')}${cell(s.invites,'open invites')}</div>
    <p class="shlabel">Waiting to be let in</p>${wait.length?`<div class="rows">${wait.map(pRow).join('')}</div>`:`<p class="fine adnone">Nobody is waiting.</p>`}
    <p class="shlabel">Testers</p>${rest.length?`<div class="rows">${rest.map(pRow).join('')}</div>`:`<p class="fine adnone">No other testers yet. Invite one from Account.</p>`}
    <p class="shlabel">Requests from visitors</p>${reqHtml()}
    <p class="shlabel">Anonymous usage log</p>${anonHtml(s)}
    <p class="fine">Issues and feedback from testers will be listed here once that feature is built.</p></div>`; }
/* Requests for a listener test or for research: most asked-for first. Tap one to read it and settle it. */
const reqTitle=r=>{ const f=r.ref||{}; return (r.kind==='listener'?'Listener test':'Research')+' · '+(f.label||r.key)+(r.kind==='listener'&&f.y0!=null?' · '+(f.y0===f.y1?fmtY(f.y0):fmtY(f.y0)+'–'+fmtY(f.y1)):''); };
function reqHtml(){ const R=AD.reqs; if(R==null) return `<p class="fine adnone">Not available.</p>`; if(!R.length) return `<p class="fine adnone">No open requests.</p>`;
  return `<div class="rows">${R.map(r=>`<button type="button" class="rowb adp" data-rq="${r.id}"><span class="rmain"><b>${esc(reqTitle(r))}</b><small>Asked ${r.n} time${r.n===1?'':'s'} · last ${fmtD(Date.parse(r.last_at))}</small></span><span class="rchev">${ic('chev')}</span></button>`).join('')}</div>${R.length===100?'<p class="fine">Showing the 100 most asked-for.</p>':''}`; }
function openReq(id){ const r=(AD.reqs||[]).find(x=>String(x.id)===String(id)), c=cl(); if(!r||!c) return; const f=r.ref||{};
  const b=UI.detail(reqTitle(r),`<p class="fine dsub">Asked ${r.n} time${r.n===1?'':'s'} · last ${fmtD(Date.parse(r.last_at))}${f.mode?' · '+(f.mode==='home'?'made there':'heard there'):''}</p>
    ${f.prompt?`<p class="shlabel">The prompt to test</p><textarea class="adprompt" readonly rows="8">${esc(f.prompt)}</textarea>`:''}
    <div class="rows adacts"><button type="button" class="rowb adact" data-st="done">Mark as done</button><button type="button" class="rowb adact danger" data-st="declined">Decline</button></div>`);
  b.onclick=async ev=>{ const x=ev.target.closest('.adact'); if(!x) return; UI.sheet.close(); const {error}=await c.from('requests').update({status:x.dataset.st}).eq('id',r.id); AD.err=error?(error.message||'That did not work.'):''; await adminLoad(); }; }
/* The anonymous log keeps the newest rows up to its limit; past that the oldest are replaced. Warn before that happens so they can be saved first. */
function anonHtml(s){ if(s.anon==null) return `<p class="fine adnone">Not available.</p>`; const cap=s.anon_cap||1, pc=Math.min(100,Math.round(100*s.anon/cap)), warn=pc>=80, full=s.anon>=cap;
  return `<div class="adlog${warn?' warn':''}"><div class="adlogh"><b>${Number(s.anon).toLocaleString()} of ${Number(cap).toLocaleString()} rows</b><span>${pc}%</span></div>
    <div class="adbar"><i style="width:${Math.max(pc,1)}%"></i></div>
    <p class="fine">${full?'Full: each new row now replaces the oldest one. Export to keep a copy of what is there.':warn?'Nearly full. Past the limit the oldest rows are replaced by new ones. Export first if you want to keep them.':'Visitors who are not signed in: views opened, places and years chosen, prompts copied. No identifiers.'}${s.anon_from?' Oldest row: '+fmtD(Date.parse(s.anon_from))+'.':''} ${Number(s.anon7||0).toLocaleString()} in the last 7 days.</p>
    <div class="formrow"><button type="button" class="lbtn${warn?' primary':''}" id="adexp"${s.anon?'':' disabled'}>Export as CSV</button><span class="fine" id="adexpmsg"></span></div></div>`; }
async function exportAnon(btn,msg){ const c=cl(); if(!c) return; btn.disabled=true; const out=[['id','at','session','action','ref']]; const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  try{ for(let from=0;;from+=1000){ const {data,error}=await c.from('anon_events').select('id,at,session,action,ref').order('id').range(from,from+999); if(error) throw error; if(!data||!data.length) break;
      data.forEach(r=>out.push([r.id,r.at,r.session,r.action,r.ref?JSON.stringify(r.ref):''])); msg.textContent=(out.length-1).toLocaleString()+' rows read…'; if(data.length<1000) break; }
    const url=URL.createObjectURL(new Blob([out.map(r=>r.map(q).join(',')).join('\n')],{type:'text/csv'})), a=document.createElement('a');
    a.href=url; a.download='anonymous-usage-'+new Date().toISOString().slice(0,10)+'.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),5000);
    msg.textContent=(out.length-1).toLocaleString()+' rows saved to your downloads.'; }
  catch(e){ msg.textContent=(e&&e.message)||'The export did not finish.'; }
  btn.disabled=false; }
async function setProfile(id,role,status){ const c=cl(); if(!c) return; const {error}=await c.rpc('admin_set_profile',{target:id,new_role:role,new_status:status}); AD.err=error?(error.message||'That did not work.'):''; await adminLoad(); }
async function openTester(id){ const p=(AD.people||[]).find(x=>x.id===id), c=cl(); if(!p||!c) return;
  const act=(l,r,s,cls)=>`<button type="button" class="rowb adact ${cls||''}" data-r="${r}" data-s="${s}">${l}</button>`;
  const b=UI.detail(p.handle||'No handle yet',`<p class="fine dsub">${esc((ROLEN[p.role]||p.role)+' · '+p.status+' · joined '+fmtD(Date.parse(p.joined)))}</p>
    <div class="rows adacts">${p.status==='pending'?act('Let in',p.role,'active'):''}${p.status==='suspended'?act('Reinstate',p.role,'active'):''}${p.status==='active'&&p.role==='beta'?act('Make principal tester','principal','active'):''}${p.status==='active'&&p.role==='principal'?act('Back to beta tester','beta','active'):''}${p.status!=='suspended'?act('Suspend',p.role,'suspended','danger'):''}</div>
    <p class="shlabel">Travels</p><div id="adtrips"><p class="fine">Reading…</p></div>`);
  b.onclick=async ev=>{ const x=ev.target.closest('.adact'); if(!x) return; UI.sheet.close(); await setProfile(id,x.dataset.r,x.dataset.s); };
  const {data,error}=await c.from('trips').select('*').eq('user_id',id).order('created_at',{ascending:false}).limit(200);
  const host=b.querySelector('#adtrips'); if(!host) return;
  host.innerHTML=error?`<p class="fine">${esc(error.message||'Could not read.')}</p>`:(data&&data.length?`<div class="triplist adtl">${data.map(r=>`<div class="adtrip">${tripRow(fromDb(r),false)}</div>`).join('')}</div>${data.length===200?'<p class="fine">Showing the latest 200.</p>':''}`:`<p class="fine">No travels yet.</p>`); }
function wireAdmin(box){ box.querySelectorAll('[data-rq]').forEach(r=>r.onclick=()=>openReq(r.dataset.rq));
  const ex=box.querySelector('#adexp'); if(ex) ex.onclick=()=>exportAnon(ex,box.querySelector('#adexpmsg'));
  box.querySelectorAll('[data-ap]').forEach(r=>r.onclick=ev=>{ const ok=ev.target.closest('[data-ok]'); const p=(AD.people||[]).find(x=>x.id===r.dataset.ap); if(!p) return; if(ok){ setProfile(p.id,p.role,'active'); return; } openTester(p.id); }); }

window.PEOPLE={ openAccount, me, isGuest, isAdmin, history:()=>hist(), heardGenres, travelled, taste, add, setStatus, setField, remove:removeEntry, onChange:f=>subs.push(f), render, unreviewed:()=>[] };
VIEWHOOK.me=render;
/* follow the account: when someone becomes an active tester, fetch their travels; redraw on every change */
let lastId=null, wasPending=false;
if(A()) A().onChange(()=>{ const m=me(), id=m?m.id:null, pr=A().profile(), changed=id!==lastId; if(changed){ if(id&&wasPending) page='acct';   /* just let in: stay on the account controls */
    lastId=id; SYNC='idle'; AD={stats:null,people:null,reqs:null,err:'',at:0}; if(id) pull(); } wasPending=!!(pr&&pr.status==='pending'); fire(); if(curView()==='me'&&(changed||!(page==='acct'&&id&&document.getElementById('acctbox')))) render(); });
if(curView()==='me') render();

/* label lists that came from new research and have not been listener-tested */
const stPanelUpdate0=stPanelUpdate;
stPanelUpdate=function(){ stPanelUpdate0.apply(this,arguments);
  try{ const iso=placeIso(), el=document.getElementById('stsrc'); if(!iso||!el||!YEARL[iso]) return; const [a,b]=stRange(); let u=false;
    for(let y=Math.max(a,1900);y<=b;y++){ const c=YEARL[iso][y]; if(c&&c.status==='unreviewed'){ u=true; break; } }
    if(u) el.insertAdjacentHTML('beforeend',' <b class="unrev">New research, not yet tested with a listener.</b>'); }catch(e){} };
