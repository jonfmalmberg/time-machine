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
    <p class="shlabel">Score</p><label class="stfbs big"><input type="range" id="trate" min="1" max="10" step="1" value="${e.rating||7}" aria-label="Score out of 10"><output id="trateo">${e.rating||'–'}</output></label>
    <p class="shlabel">Note</p><textarea id="tnote" class="tnotef" rows="3" maxlength="300" placeholder="What stuck with you?">${esc(e.note||'')}</textarea>
    <div class="formrow"><button type="button" class="lbtn primary" data-again>Go again</button><button type="button" class="lbtn danger" data-rm>Remove from history</button></div>`);
  b.onclick=ev=>{ const x=ev.target.closest('button'); if(!x) return; const d=x.dataset;
    if(d.st){ setStatus(id,e.status===d.st&&d.st!=='copied'?'copied':d.st); openTrip(id); }
    else if(d.re){ setField(id,{react:e.react===d.re?null:d.re}); openTrip(id); }
    else if(d.ra){ setField(id,{rating:e.rating===+d.ra?null:+d.ra}); openTrip(id); }
    else if('again' in d) goAgain(e);
    else if('rm' in d){ if(x.dataset.sure){ removeEntry(id); UI.sheet.close(); } else { x.dataset.sure=1; x.textContent='Tap again to remove'; } } };
  const tr=b.querySelector('#trate'); if(tr){ tr.oninput=()=>{ b.querySelector('#trateo').textContent=tr.value; }; tr.onchange=()=>setField(id,{rating:+tr.value}); }
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
      c.from('requests').select('id,kind,key,ref,n,w,status,last_at').eq('status','open').order('w',{ascending:false}).limit(100)]);
    if(s.error) throw s.error; if(p.error) throw p.error; AD.stats=s.data; AD.people=p.data||[]; AD.reqs=q.error?null:(q.data||[]); AD.err=''; }
  catch(e){ AD.err=(e&&e.message)||'The admin data could not be read.'; }
  if(curView()==='me'&&page==='admin') render(); }
const pRow=p=>`<button type="button" class="rowb adp" data-ap="${p.id}"><span class="rmedia"><span class="avatar sm${p.status==='active'?'':' guest'}">${p.handle?esc(p.handle.slice(0,1).toUpperCase()):ic('person')}</span></span><span class="rmain"><b>${p.handle?esc(p.handle):'No handle yet'}</b><small>${esc((p.status==='active'?ROLEN[p.role]||p.role:p.status==='pending'?'Waiting':'Suspended')+' · joined '+fmtD(Date.parse(p.joined)))}</small></span>${p.status==='pending'?`<span class="lbtn primary adok" data-ok="${p.id}">Let in</span>`:`<span class="rchev">${ic('chev')}</span>`}</button>`;
/* The admin page has four parts: Usage (what people did), People, Requests and Ideas (decision D24). */
let ADTAB='usage'; try{ const v=localStorage.getItem('wmft-adtab'); if(['usage','people','requests','ideas'].includes(v)) ADTAB=v; }catch(e){}
function adminHtml(){ if(!AD.people&&!AD.err){ if(Date.now()-AD.at>3000) adminLoad(); return `<p class="fine adwait">Reading…</p>`; }
  if(Date.now()-AD.at>30000) adminLoad();
  const s=AD.stats||{}, P=AD.people||[], mine=me(), wait=P.filter(p=>p.status==='pending'), rest=P.filter(p=>p.status!=='pending'&&(!mine||p.id!==mine.id));
  const tabs=[['usage','Usage'],['people','People'],['requests','Requests'+(s.requests?' '+s.requests:'')],['ideas','Ideas']];
  let h=`<div class="meadmin">${AD.err?`<p class="fine acctmsg">${esc(AD.err)}</p>`:''}<span class="seg adtabs" role="tablist">${tabs.map(([k,l])=>`<button type="button" role="tab" data-adtab="${k}" aria-pressed="${ADTAB===k}">${l}</button>`).join('')}</span>`;
  if(ADTAB==='usage') h+=usageHtml(s);
  else if(ADTAB==='people') h+=`${wait.length?`<p class="shlabel">Waiting to be let in</p><div class="rows">${wait.map(pRow).join('')}</div>`:''}
    <p class="shlabel">Signed-in people</p>${rest.length?`<div class="rows">${rest.map(pRow).join('')}</div>`:`<p class="fine adnone">Nobody else has signed in yet.</p>`}
    <p class="fine">New accounts are let in at once. Approval will apply to filing issues and voting when those are built.</p>`;
  else if(ADTAB==='requests') h+=`<p class="shlabel">Requests from visitors</p>${reqHtml()}<p class="fine">Issues and feedback from testers will be listed here once that feature is built.</p>`;
  else h+=ideasHtml();
  return h+`</div>`; }

/* Usage: one summary for signed-in people and for visitors, read from admin_usage(days) */
let US={days:14,data:null,err:'',at:0,busy:false};
async function usageLoad(){ const c=cl(); if(!c||US.busy) return; US.busy=true; US.at=Date.now();
  try{ const r=await c.rpc('admin_usage',{days:US.days}); if(!r||r.error) throw (r&&r.error)||new Error('Not available.'); US.data=r.data; US.err=''; }
  catch(e){ US.err=(e&&e.message)||'Not available.'; US.data=null; }
  US.busy=false; if(curView()==='me'&&page==='admin'&&ADTAB==='usage') render(); }
const VIEWN={map:'Map',list:'List',tree:'Tree',tunnel:'Tunnel',journey:'Journey',data:'Data',me:'Account'};
function useKey(kind,k){ try{ if(kind==='views') return VIEWN[k]||k; if(kind==='decades') return k+'s'; if(kind==='services') return ({spotify:'Spotify',youtube:'YouTube',apple:'Apple Music',list:'Song list'})[k]||k;
    if(kind==='genres') return String(k).split('+').map(x=>{ const id=x.replace(/^multi:/,'').split(':').pop(), pre=x.replace(/^multi:/,'').split(':')[0]; return pre==='mov'&&byId[id]?byId[id].name:pre==='band'&&bandName[id]?bandName[id]:id; }).join(' + ');
    return String(k).replace(/^multi:/,'').split('+').map(x=>{ const [t,...r]=x.split(':'); return t==='cty'?isoName(r[0]):t==='reg'?(regName[r[0]]||r[0]):t==='city'?r.slice(1).join(':')+', '+isoName(r[0]):x; }).join(' + '); }catch(e){ return String(k); } }
function usageHtml(s){ const D=US.data;
  const seg=`<span class="seg addays">${[7,14,30,90].map(d=>`<button type="button" data-addays="${d}" aria-pressed="${US.days===d}">${d} days</button>`).join('')}</span>`;
  if(!D){ if(!US.busy&&(!US.at||Date.now()-US.at>8000)) usageLoad(); return seg+`<p class="fine adwait">${US.err?esc(US.err):'Reading…'}</p>`+`<p class="shlabel">Anonymous usage log</p>${anonHtml(s)}`; }
  if(D.days!==US.days&&!US.busy) usageLoad();
  const F={anon:{visits:0},member:{visits:0}}; (D.funnel||[]).forEach(f=>{ F[f.who]=f; });
  const tot=(F.anon.visits||0)+(F.member.visits||0), pc=(n,d)=>d?Math.round(100*(n||0)/d)+'%':'–', sum=k=>(F.anon[k]||0)+(F.member[k]||0);
  const cell=(n,l)=>`<span class="stat"><b>${n==null?'–':n}</b><small>${l}</small></span>`;
  const dur=x=>x==null?'–':x<60?Math.round(x)+' s':Math.round(x/60)+' min';
  const days=D.by_day||[], mx=Math.max(1,...days.map(d=>d.anon+d.member));
  const chart=days.length?`<div class="adchart" role="img" aria-label="Visits per day">${days.map(d=>`<span class="adcol" title="${d.d}: ${d.member} signed in, ${d.anon} not"><i class="m" style="height:${Math.round(64*d.member/mx)}px"></i><i class="a" style="height:${Math.round(64*d.anon/mx)}px"></i></span>`).join('')}</div><p class="fine adleg"><span><i class="m"></i>signed in</span><span><i class="a"></i>not signed in</span><span class="sp"></span>${esc(days[0].d)} to ${esc(days[days.length-1].d)} (UTC)</p>`:`<p class="fine adnone">No visits in this period.</p>`;
  const steps=[['visits','Visits'],['stayed','Did more than open the page'],['chose','Chose a place, time or genre'],['panel','Used a playlist'],['played','Played a song'],['took','Took a playlist away'],['shared','Shared a link']];
  const fun=`<div class="adtable"><div class="adtr adth"><span></span><span>Not signed in</span><span>Signed in</span></div>${steps.map(([k,l])=>`<div class="adtr"><span>${l}</span><span><b>${F.anon[k]||0}</b>${k==='visits'?'':` <small>${pc(F.anon[k],F.anon.visits)}</small>`}</span><span><b>${F.member[k]||0}</b>${k==='visits'?'':` <small>${pc(F.member[k],F.member.visits)}</small>`}</span></div>`).join('')}<div class="adtr"><span>Median time on the site</span><span><b>${dur(F.anon.median_seconds)}</b></span><span><b>${dur(F.member.median_seconds)}</b></span></div></div>`;
  const top=(kind,title,empty)=>{ const R=D[kind]||[], m=Math.max(1,...R.map(r=>r.n)); return `<p class="shlabel">${title}</p>${R.length?`<div class="adtop">${R.slice(0,10).map(r=>`<div class="adbarrow"><span class="adbl">${esc(useKey(kind,r.k))}</span><span class="adbt"><i style="width:${Math.max(3,Math.round(100*r.n/m))}%"></i></span><span class="adbn">${r.n}${r.member?` <small>${r.member} signed in</small>`:''}</span></div>`).join('')}</div>`:`<p class="fine adnone">${empty}</p>`}`; };
  const M=D.members||[], T=D.trips||{};
  return seg+`<div class="mestats">${cell(tot,'visits')}${cell(F.member.visits||0,'signed in')}${cell(pc(sum('chose'),tot),'chose something')}${cell(pc(sum('panel'),tot),'used a playlist')}${cell(pc(sum('played')+0,tot),'played a song')}${cell(s.active,'accounts')}</div>
    ${chart}<p class="shlabel">How far visits get</p>${fun}
    <p class="shlabel">Signed-in people, by last visit</p>${M.length?`<div class="rows">${M.map(m=>`<button type="button" class="rowb adp" data-ap="${m.id}"><span class="rmain"><b>${m.handle?esc(m.handle):'No handle yet'}</b><small>${m.visits} visit${m.visits===1?'':'s'} · ${m.events} actions · ${m.trips} trip${m.trips===1?'':'s'}, ${m.reviewed} reviewed · last ${fmtD(Date.parse(m.last))}</small></span><span class="rchev">${ic('chev')}</span></button>`).join('')}</div>`:`<p class="fine adnone">No signed-in visits in this period.</p>`}
    <p class="shlabel">Travel log, all time</p><div class="mestats">${cell(T.total,'trips')}${cell(T.reviewed,'reviewed')}${cell(T.rated,'scored')}${cell(T.mean_rating,'mean score')}${cell((T.by_status||{}).loved||0,'loved')}${cell((T.by_status||{}).left||0,'not for me')}</div>
    ${top('places','Places chosen','Nobody chose a place.')}${top('decades','Decades chosen','Nobody chose a decade.')}${top('genres','Genres chosen','Nobody chose a genre.')}${top('views','Views opened','')}${top('services','Where songs were played','No songs played.')}
    <p class="shlabel">Every action</p><div class="adtop">${(D.actions||[]).map(r=>`<div class="adbarrow"><span class="adbl">${esc(r.action)}</span><span class="adbt"></span><span class="adbn">${r.n}${r.member?` <small>${r.member} signed in</small>`:''}</span></div>`).join('')}</div>
    <p class="fine">Visits are counted per page load. Counts are by visit, not by person: a visitor who is not signed in has no identity here.</p>
    <p class="shlabel">Anonymous usage log</p>${anonHtml(s)}`; }

/* Ideas: features that could be built, in the owner's order. Drag the handle to reorder; tap a row to edit. */
let ID={rows:null,err:'',at:0,show:'open'};
const IDST={idea:'Idea',next:'Next',building:'Building',done:'Done',dropped:'Dropped'};
async function ideasLoad(){ const c=cl(); if(!c) return; ID.at=Date.now();
  try{ const r=await c.from('ideas').select('*').order('pos',{ascending:true}).limit(500); if(!r||r.error) throw (r&&r.error)||new Error('Not available.'); ID.rows=r.data||[]; ID.err=''; }
  catch(e){ ID.err=(e&&e.message)||'Not available.'; ID.rows=ID.rows||[]; }
  if(curView()==='me'&&page==='admin'&&ADTAB==='ideas') render(); }
const idShown=()=>(ID.rows||[]).filter(r=>ID.show==='open'?(r.status!=='done'&&r.status!=='dropped'):(r.status==='done'||r.status==='dropped')).sort((a,b)=>a.pos-b.pos);
function ideasHtml(){ if(ID.rows==null){ if(Date.now()-ID.at>3000) ideasLoad(); return `<p class="fine adwait">Reading…</p>`; }
  const V=idShown();
  return `<span class="seg addays">${[['open','To do'],['closed','Done or dropped']].map(([k,l])=>`<button type="button" data-idshow="${k}" aria-pressed="${ID.show===k}">${l}</button>`).join('')}</span>
    ${ID.err?`<p class="fine acctmsg">${esc(ID.err)}</p>`:''}
    ${ID.show==='open'?`<form class="idadd" id="idadd"><input id="idnew" type="text" maxlength="120" placeholder="Add an idea" autocomplete="off"><button type="submit" class="lbtn primary">Add</button></form>`:''}
    ${V.length?`<div class="rows idlist" id="idlist">${V.map((r,i)=>`<div class="idrow" data-id="${r.id}">${ID.show==='open'?`<span class="idh" aria-label="Drag to reorder" role="button">${ic('grip')}</span>`:''}<button type="button" class="idmain" data-idopen="${r.id}"><b>${ID.show==='open'?`<i class="idn">${i+1}</i>`:''}${esc(r.title)}</b><small>${[r.status!=='idea'?IDST[r.status]:'',r.area||'',r.size?({S:'small',M:'medium',L:'large'})[r.size]:'',r.by==='lead'?'from Claude':''].filter(Boolean).map(esc).join(' · ')}</small></button><span class="rchev">${ic('chev')}</span></div>`).join('')}</div>`:`<p class="fine adnone">Nothing here.</p>`}
    ${ID.show==='open'?'<p class="fine">Top of the list is what you want first. Drag the handle to reorder.</p>':''}`; }
async function ideaSave(id,o){ const c=cl(), r=(ID.rows||[]).find(x=>String(x.id)===String(id)); if(!c||!r) return; Object.assign(r,o);
  try{ const q=await c.from('ideas').update({...o,updated_at:new Date().toISOString()}).eq('id',r.id); if(q&&q.error) throw q.error; ID.err=''; }catch(e){ ID.err=(e&&e.message)||'That did not save.'; } }
async function ideaMove(id,to){ const V=idShown(), i=V.findIndex(x=>String(x.id)===String(id)); if(i<0||to===i) return; const [r]=V.splice(i,1); V.splice(to,0,r);
  const p=V[to-1], n=V[to+1], pos=p&&n?(p.pos+n.pos)/2:p?p.pos+1:n?n.pos-1:0; await ideaSave(id,{pos}); render(); }
function openIdea(id){ const r=(ID.rows||[]).find(x=>String(x.id)===String(id)), c=cl(); if(!r||!c) return;
  const b=UI.detail('Idea',`<label class="idf"><span class="shlabel">Title</span><input id="idt" type="text" maxlength="120" value="${esc(r.title)}"></label>
    <label class="idf"><span class="shlabel">What and why</span><textarea id="idb" rows="6" maxlength="800">${esc(r.body||'')}</textarea></label>
    <p class="shlabel">State</p><span class="seg idst">${Object.keys(IDST).map(k=>`<button type="button" data-idst="${k}" aria-pressed="${r.status===k}">${IDST[k]}</button>`).join('')}</span>
    <p class="shlabel">Size</p><span class="seg idst">${[['S','Small'],['M','Medium'],['L','Large']].map(([k,l])=>`<button type="button" data-idsz="${k}" aria-pressed="${r.size===k}">${l}</button>`).join('')}</span>
    <p class="fine">${esc((r.area?r.area+' · ':'')+(r.by==='lead'?'Suggested by Claude':'Yours')+' · added '+fmtD(Date.parse(r.created_at)))}</p>
    <div class="formrow"><button type="button" class="lbtn primary" data-idtop="1">Move to top</button><button type="button" class="lbtn danger" data-idrm="1">Delete</button></div>`);
  const t=b.querySelector('#idt'), bd=b.querySelector('#idb');
  t.onchange=async()=>{ const v=t.value.trim().slice(0,120); if(v){ await ideaSave(id,{title:v}); render(); } };
  bd.onchange=()=>ideaSave(id,{body:bd.value.slice(0,800)});
  b.onclick=async ev=>{ const x=ev.target.closest('button'); if(!x) return; const d=x.dataset;
    if(d.idst){ await ideaSave(id,{status:d.idst}); render(); openIdea(id); }
    else if(d.idsz){ await ideaSave(id,{size:r.size===d.idsz?null:d.idsz}); render(); openIdea(id); }
    else if(d.idtop){ UI.sheet.close(); ID.show='open'; await ideaMove(id,0); }
    else if(d.idrm){ if(!d.sure){ x.dataset.sure=1; x.textContent='Tap again to delete'; return; } UI.sheet.close(); try{ await c.from('ideas').delete().eq('id',r.id); }catch(e){} ID.rows=ID.rows.filter(z=>z!==r); render(); } }; }
function wireIdeas(box){ box.querySelectorAll('[data-idshow]').forEach(x=>x.onclick=()=>{ ID.show=x.dataset.idshow; render(); });
  box.querySelectorAll('[data-idopen]').forEach(x=>x.onclick=()=>openIdea(x.dataset.idopen));
  const f=box.querySelector('#idadd'); if(f) f.onsubmit=async ev=>{ ev.preventDefault(); const c=cl(), inp=box.querySelector('#idnew'), v=inp.value.trim().slice(0,120); if(!c||!v) return;
    const V=idShown(), pos=V.length?V[0].pos-1:0;
    try{ const q=await c.from('ideas').insert({title:v,pos,by:'owner'}).select().single(); if(!q||q.error) throw (q&&q.error)||new Error('x'); ID.rows.push(q.data); ID.err=''; }catch(e){ ID.err=(e&&e.message)||'That did not save.'; } render(); };
  const list=box.querySelector('#idlist'); if(!list) return;
  list.querySelectorAll('.idh').forEach(h=>{ h.onpointerdown=ev=>{ ev.preventDefault(); const row=h.closest('.idrow'), rows=[...list.children], y0=ev.clientY, hgt=row.offsetHeight, i0=rows.indexOf(row); let i1=i0;
      row.classList.add('drag'); try{ h.setPointerCapture(ev.pointerId); }catch(e){}
      h.onpointermove=e=>{ const dy=e.clientY-y0; row.style.transform=`translateY(${dy}px)`; i1=Math.max(0,Math.min(rows.length-1,i0+Math.round(dy/hgt)));
        rows.forEach((r,i)=>{ if(r!==row) r.style.transform=(i0<i1&&i>i0&&i<=i1)?`translateY(${-hgt}px)`:(i1<i0&&i>=i1&&i<i0)?`translateY(${hgt}px)`:''; }); };
      h.onpointerup=h.onpointercancel=()=>{ h.onpointermove=h.onpointerup=h.onpointercancel=null; rows.forEach(r=>{ r.style.transform=''; }); row.classList.remove('drag'); if(i1!==i0) ideaMove(row.dataset.id,i1); }; }; }); }
/* Requests for a listener test or for research: most asked-for first. Tap one to read it and settle it. */
const reqTitle=r=>{ const f=r.ref||{}; return (r.kind==='listener'?'Listener test':'Research')+' · '+(f.label||r.key)+(r.kind==='listener'&&f.y0!=null?' · '+(f.y0===f.y1?fmtY(f.y0):fmtY(f.y0)+'–'+fmtY(f.y1)):''); };
/* n counts asks; w is their weight: an ask spread over ten decades adds 0.1 to each */
const askN=r=>`Asked ${r.n} time${r.n===1?'':'s'}`+(r.w!=null&&Math.abs(r.w-r.n)>.005?`, weight ${(+r.w).toFixed(2).replace(/0$/,'')}`:'');
function reqHtml(){ const R=AD.reqs; if(R==null) return `<p class="fine adnone">Not available.</p>`; if(!R.length) return `<p class="fine adnone">No open requests.</p>`;
  return `<div class="rows">${R.map(r=>`<button type="button" class="rowb adp" data-rq="${r.id}"><span class="rmain"><b>${esc(reqTitle(r))}</b><small>${askN(r)} · last ${fmtD(Date.parse(r.last_at))}</small></span><span class="rchev">${ic('chev')}</span></button>`).join('')}</div>${R.length===100?'<p class="fine">Showing the 100 most asked-for.</p>':''}`; }
function openReq(id){ const r=(AD.reqs||[]).find(x=>String(x.id)===String(id)), c=cl(); if(!r||!c) return; const f=r.ref||{};
  const b=UI.detail(reqTitle(r),`<p class="fine dsub">${askN(r)} · last ${fmtD(Date.parse(r.last_at))}${f.mode?' · '+(f.mode==='home'?'made there':'heard there'):''}</p>
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
function wireAdmin(box){ box.querySelectorAll('[data-adtab]').forEach(x=>x.onclick=()=>{ ADTAB=x.dataset.adtab; try{ localStorage.setItem('wmft-adtab',ADTAB); }catch(e){} render(); });
  box.querySelectorAll('[data-addays]').forEach(x=>x.onclick=()=>{ US.days=+x.dataset.addays; US.data=null; US.at=0; render(); }); wireIdeas(box);
  box.querySelectorAll('[data-rq]').forEach(r=>r.onclick=()=>openReq(r.dataset.rq));
  const ex=box.querySelector('#adexp'); if(ex) ex.onclick=()=>exportAnon(ex,box.querySelector('#adexpmsg'));
  box.querySelectorAll('[data-ap]').forEach(r=>r.onclick=ev=>{ const ok=ev.target.closest('[data-ok]'); const p=(AD.people||[]).find(x=>x.id===r.dataset.ap); if(!p) return; if(ok){ setProfile(p.id,p.role,'active'); return; } openTester(p.id); }); }

window.PEOPLE={ openAccount, me, isGuest, isAdmin, history:()=>hist(), heardGenres, travelled, taste, add, setStatus, setField, remove:removeEntry, onChange:f=>subs.push(f), render, unreviewed:()=>[] };
VIEWHOOK.me=render;
/* follow the account: when someone becomes an active tester, fetch their travels; redraw on every change */
let lastId=null, wasPending=false;
if(A()) A().onChange(()=>{ const m=me(), id=m?m.id:null, pr=A().profile(), changed=id!==lastId; if(changed){ if(id&&wasPending) page='acct';   /* just let in: stay on the account controls */
    lastId=id; SYNC='idle'; AD={stats:null,people:null,reqs:null,err:'',at:0}; US.data=null; US.at=0; ID.rows=null; ID.at=0; if(id) pull(); } wasPending=!!(pr&&pr.status==='pending'); fire(); if(curView()==='me'&&(changed||!(page==='acct'&&id&&document.getElementById('acctbox')))) render(); });
if(curView()==='me') render();

/* Trip feedback where the listening happens (decision D23).
   A trip is logged when a signed-in person engages with a playlist: plays a song, opens a service or copies a
   prompt. Once there is a trip for what the panel shows, the panel carries one row to say how it went: one tap
   for the mark, then an optional score. A visitor who is not signed in gets one quiet line, once per visit. */
const curKey=()=>{ if(typeof GP!=='undefined'&&GP!=null) return {kind:'genre',key:GP};
  if(!STP) return null; return {kind:'trip',key:[plKey(STP)||placeName(),STY,STSPAN,STFROM,PMODE].join('|')}; };
const curTrip=()=>{ const k=curKey(); if(!k||!me()) return null; return hist().filter(e=>e.kind===k.kind&&e.key===k.key).sort((a,b)=>b.at-a.at)[0]||null; };
const ENG=new Set(); let nudged=false;
function engage(){ const k=curKey(); if(!k) return;
  if(!me()){ if(!nudged){ nudged=true; fbPaint(); } return; }
  if(ENG.has(k.kind+k.key)) return; ENG.add(k.kind+k.key);
  if(curTrip()&&Date.now()-curTrip().at<864e5){ fbPaint(); return; }
  if(k.kind==='genre'){ if(byId[GP]) add({kind:'genre',key:GP,gid:GP,place:byId[GP].place,reg:byId[GP].reg,year:byId[GP].year}); }
  else add({kind:'trip',key:k.key,place:placeName(),iso:placeIso()||null,reg:placeIso()?isoReg(placeIso()):(STP.k==='reg'?STP.reg:null),year:STY,span:STSPAN,from:STFROM,when:stWhen(),mode:PMODE,pl:{...STP}});
  fbPaint(); }
{ const T0=window.TRACK; window.TRACK=function(a){ try{ if(a==='play'||a==='listen'||a==='open_link'||a==='platform') engage(); }catch(e){} return T0?T0.apply(this,arguments):undefined; }; }
const FBM=[['loved','heart','Loved it'],['listened','check','Good'],['left','exit','Not for me']];
function fbPaint(){ const pan=document.getElementById('stpanel'), tabs=document.getElementById('sttabs'); if(!pan||!tabs) return;
  let el=document.getElementById('stfb'); if(!el){ el=document.createElement('div'); el.id='stfb'; el.className='stfb'; el.hidden=true; tabs.insertAdjacentElement('afterend',el);
    el.addEventListener('click',ev=>{ const b=ev.target.closest('button'); if(!b) return; const t=curTrip();
      if(b.dataset.fbsign){ const a=A(); if(a&&a.signIn) a.signIn(); track('nudge',{to:'signin'}); return; }
      if(b.dataset.fbx){ el.hidden=true; el.dataset.off='1'; return; }
      if(!t) return;
      if(b.dataset.fb){ setStatus(t.id,t.status===b.dataset.fb?'copied':b.dataset.fb); track('trip_mark',{st:b.dataset.fb,from:'panel'}); fbPaint(); }
      else if(b.dataset.fbmore) openTrip(t.id); });
    el.addEventListener('change',ev=>{ const r=ev.target.closest('#stfbr'), t=curTrip(); if(r&&t){ setField(t.id,{rating:+r.value}); track('trip_rate',{r:+r.value,from:'panel'}); fbPaint(); } });
    el.addEventListener('input',ev=>{ const r=ev.target.closest('#stfbr'), o=document.getElementById('stfbo'); if(r&&o) o.textContent=r.value; }); }
  if(!me()){ if(!nudged||el.dataset.off||!curKey()){ el.hidden=true; return; }
    el.hidden=false; el.innerHTML=`<span class="stfbq">Sign in to keep a log of where you have been.</span><button type="button" class="lbtn primary" data-fbsign="1">Sign in</button><button type="button" class="stfbx" data-fbx="1" aria-label="Dismiss">${ic('x')}</button>`; return; }
  const t=curTrip(); if(!t||t.status==='never'){ el.hidden=true; return; }
  const marked=t.status!=='copied';
  el.hidden=false; el.innerHTML=`<span class="stfbq">${marked?'Your trip':'How is it?'}</span><span class="stfbm">${FBM.map(([k,i,l])=>`<button type="button" class="stfbb a-${k}${t.status===k?' on':''}" data-fb="${k}" aria-pressed="${t.status===k}" aria-label="${l}" title="${l}">${ic(i)}${marked&&t.status!==k?'':`<span>${l}</span>`}</button>`).join('')}</span>
    ${marked?`<label class="stfbs"><input type="range" id="stfbr" min="1" max="10" step="1" value="${t.rating||7}" aria-label="Score out of 10"><output id="stfbo">${t.rating||'–'}</output></label><button type="button" class="stfbx" data-fbmore="1" aria-label="Add a note">${ic('dots')}</button>`:''}`; }
subs.push(()=>{ try{ fbPaint(); }catch(e){} });

/* label lists that came from new research and have not been listener-tested */
const stPanelUpdate0=stPanelUpdate;
stPanelUpdate=function(){ stPanelUpdate0.apply(this,arguments); try{ fbPaint(); }catch(e){}
  try{ const iso=placeIso(), el=document.getElementById('stsrc'); if(!iso||!el||!YEARL[iso]) return; const [a,b]=stRange(); let u=false;
    for(let y=Math.max(a,1900);y<=b;y++){ const c=YEARL[iso][y]; if(c&&c.status==='unreviewed'){ u=true; break; } }
    if(u) el.insertAdjacentHTML('beforeend',' <b class="unrev">New research, not yet tested with a listener.</b>'); }catch(e){} };
