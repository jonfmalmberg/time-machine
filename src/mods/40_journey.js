/* Journey tab: four kinds of ordered walk (a life, music history, world traveller, discovery walk).
   Replaces the content of #view-journey; settings and ticks are kept per person. */
const root=document.getElementById('view-journey');
const MEMJ={};
const JLS={ get(k){ try{ const v=localStorage.getItem(k); if(v!=null) return JSON.parse(v); }catch(e){} return k in MEMJ?JSON.parse(MEMJ[k]):null; },
            set(k,v){ MEMJ[k]=JSON.stringify(v); try{ localStorage.setItem(k,MEMJ[k]); }catch(e){} } };
const P=()=>window.PEOPLE||null;
const pid=()=>{ try{ const m=P()&&P().me(); return (m&&m.id)||'guest'; }catch(e){ return 'guest'; } };
const NOWY=Math.max(1900,Math.min(T1,new Date().getFullYear()));
const KINDS=[['course','Course'],['life','A life'],['hist','History'],['trav','Traveller'],['disc','Discovery']];
const INTRO={
  course:'A short course in the history of the world\'s music: eleven chapters from the oldest music still heard to now. Each chapter is a handful of stops chosen so that no region or lineage crowds out the rest. Read what to listen for, play the first songs, open the playlist, move on.',
  life:'Follow one person or family through the places and years they lived in. List the legs in order, with brief trips where they happened; each stop is a playlist prompt for that place and time.',
  hist:'A course through the family tree. First the essentials, oldest to newest; then back to the start for everything else, era by era.',
  trav:'Visit one region at a time, the most significant music first. Stay as long as you like, move on, come home in between, and come back later for more depth.',
  disc:'A semi-random walk through every movement: the most significant first, rotating home, abroad and back in time, with a guard that follows hard listening with something easier. Move the sliders to re-sort.' };
const REGS=REG.map(r=>r[0]);
const DEF0=['eur','easia','casia','afr','mena','sasia','seasia','latam','carib','nam']; const DEFORDER=[...DEF0,...REGS.filter(r=>!DEF0.includes(r))].filter(r=>REGS.includes(r));
const fresh=()=>({ kind:'course', course:{ch:null}, open:true, hide:false,
  life:{title:'',birth:null,cut:'auto',legs:[]},
  hist:{n:40},
  trav:{order:DEFORDER.slice(),off:[],narrow:{},depth:5,mode:'cont',home:null,laps:false,mix:true,ro:false,extra:{},skip:{}},
  disc:{w:{S:7,A:5,F:3,I:5},o:{knownLast:true,roots:true}},
  done:{} });
let J=null, JPID=null, PK=null, SHOWN=null, UNDO=null;
function state(){ const p=pid(); if(J&&JPID===p) return J;
  const d=fresh(), v=JLS.get('wmft-j2-'+p)||{};
  J={...d,...v,life:{...d.life,...(v.life||{})},hist:{...d.hist,...(v.hist||{})},trav:{...d.trav,...(v.trav||{})},disc:{w:{...d.disc.w,...((v.disc||{}).w||{})},o:{...d.disc.o,...((v.disc||{}).o||{})}},done:{...(v.done||{})}};
  if(!KINDS.some(k=>k[0]===J.kind)) J.kind='hist'; if(!J.course||typeof J.course!=='object') J.course={ch:null};
  J.trav.order=[...J.trav.order.filter(r=>REGS.includes(r)),...DEFORDER.filter(r=>!J.trav.order.includes(r))];
  J.life.legs=(Array.isArray(J.life.legs)?J.life.legs:[]).map(l=>({...l,pl:fixPl(l.pl)}));
  J.trav.home=fixPl(J.trav.home);
  // the ticks made on this device before there were journeys per person stay with Guest
  if(p==='guest'&&!v.done){ try{ DONE.forEach(id=>{ if(byId[id]) J.done['g:'+id]=1; }); if(typeof JW==='object'&&!v.disc){ J.disc.w={...J.disc.w,...JW}; J.disc.o={knownLast:!!JOPT.knownLast,roots:!!JOPT.roots}; J.hide=!!JOPT.hideDone; } }catch(e){} }
  JPID=p; PK=null; SHOWN=null; UNDO=null; return J; }
const save=()=>{ if(J) JLS.set('wmft-j2-'+JPID,J); };

/* ---------- places ---------- */
const norm=x=>String(x).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const plIso=p=>!p||p.k==='reg'?null:(p.k==='city'?(CITIES[p.i]||{}).iso2:p.iso);
const plReg=p=>!p?null:p.k==='reg'?p.reg:isoReg(plIso(p));
const plName=(p,y)=>{ if(!p) return ''; if(p.k==='reg') return regName[p.reg]; if(p.k==='cty') return isoName(p.iso);
  const c=CITIES[p.i]; return c?`${cityName(c,y==null?T1:y)}, ${isoName(c.iso2)}`:(p.n||'?'); };
const plKey=p=>p.k==='reg'?'reg:'+p.reg:p.k==='cty'?'cty:'+p.iso:'city:'+((CITIES[p.i]||{}).name||p.n)+'~'+p.iso;
const clean=p=>p.k==='reg'?{k:'reg',reg:p.reg}:p.k==='cty'?{k:'cty',iso:p.iso}:{k:'city',i:p.i,iso:p.iso};
const findCity=(name,iso)=>{ const q=norm(name); return CITIES.findIndex(c=>c.iso2===iso&&norm(c.name)===q); };
// a stored city carries its name, so it survives the city list changing between builds
function fixPl(p){ if(!p||!p.k) return null;
  if(p.k==='reg') return REGS.includes(p.reg)?p:null;
  if(p.k==='cty') return ISO[p.iso]?p:null;
  const c=CITIES[p.i]; if(!c||c.iso2!==p.iso||(p.n&&c.name!==p.n)){ const i=p.n?findCity(p.n,p.iso):-1; if(i<0) return ISO[p.iso]?{k:'cty',iso:p.iso}:null; p.i=i; }
  p.n=CITIES[p.i].name; return p; }
function parsePl(v){ const i=v.indexOf(':'), k=v.slice(0,i), x=v.slice(i+1);
  if(k==='reg') return fixPl({k:'reg',reg:x}); if(k==='cty') return fixPl({k:'cty',iso:x});
  if(/^\d+$/.test(x)){ const c=CITIES[+x]; return c?{k:'city',i:+x,iso:c.iso2,n:c.name}:null; }
  const [n,iso]=x.split('~'), ci=findCity(n,iso); return ci>=0?{k:'city',i:ci,iso,n:CITIES[ci].name}:fixPl({k:'cty',iso}); }
function pickerResults(q){ const t=norm(q.trim()), out=[];
  if(!t) return REGS.map(r=>`<button type="button" data-pk="reg:${r}"><b>${esc(regName[r])}</b> <small>continent</small></button>`).join('')+'<p class="fine">Type to find a country, city or area.</p>';
  REGS.forEach(r=>{ if(norm(regName[r]).includes(t)) out.push(`<button type="button" data-pk="reg:${r}"><b>${esc(regName[r])}</b> <small>continent</small></button>`); });
  Object.keys(ISO).filter(i=>norm(isoName(i)).includes(t)).sort((a,b)=>(norm(isoName(a)).startsWith(t)?0:1)-(norm(isoName(b)).startsWith(t)?0:1)||isoName(a).localeCompare(isoName(b))).slice(0,14)
    .forEach(i=>out.push(`<button type="button" data-pk="cty:${i}"><b>${esc(isoName(i))}</b> <small>country</small></button>`));
  const cs=[]; CITIES.forEach((c,i)=>{ if(norm(c.name).includes(t)||(c.names||[]).some(n=>norm(n[1]).includes(t))) cs.push([c,i]); });
  cs.sort((a,b)=>(norm(a[0].name).startsWith(t)?0:1)-(norm(b[0].name).startsWith(t)?0:1)||(b[0].size||0)-(a[0].size||0)).slice(0,24)
    .forEach(([c,i])=>out.push(`<button type="button" data-pk="city:${i}"><b>${esc(c.name)}</b> <small>${c.kind==='area'?'area, ':''}${esc(isoName(c.iso2))}</small></button>`));
  return out.length?out.join(''):'<p class="fine">No place by that name.</p>'; }
const pickerHtml=()=>`<div class="j4pick"><input type="search" class="j4pkq" placeholder="Search continents, countries, cities and areas…" aria-label="Search places" value="${esc(PK.q||'')}"><div class="j4pkres">${pickerResults(PK.q||'')}</div></div>`;
const placeBtn=(tgt,p,y)=>`<button type="button" class="lbtn j4place${p?'':' j4miss'}" data-act="pick" data-tgt="${tgt}" aria-expanded="${!!(PK&&PK.tgt===tgt)}">${p?esc(plName(p,y)):'Choose a place…'}</button>`;

/* ---------- place-and-time stops ---------- */
// how a span of years becomes the site's year + stay: one year; a centred stay when the span is symmetric; otherwise a from-to range
function timeSpec(y0,y1){ if(y0===y1) return {year:y0,span:0,from:null}; if((y1-y0)%2===0) return {year:(y0+y1)/2,span:(y1-y0)/2,from:null}; return {year:y1,span:1,from:y0}; }
const whenTxt=(y0,y1)=>y0===y1?fmtY(y0):((y1===y0+9&&y0>=1900&&y0%10===0)?`the ${y0}s`:`${fmtY(y0)}–${fmtY(y1)}`);
function histKey(st){ const t=timeSpec(st.y0,st.y1), iso=plIso(st.pl); return [iso||plName(st.pl,t.year),t.year,t.span,t.from,PMODE].join('|'); }
const pStop=(pl,y0,y1,x)=>({t:'p',pl,y0,y1,k:'p:'+plKey(pl)+'|'+y0+'|'+y1,...(x||{})});
// 'year' = hit lists for (nearly) every year of the stop; 'sparse' = some; 'decade' = only a decade list; 'none'
function research(st){ const iso=plIso(st.pl); if(!iso) return null; if(st.y1<1940) return {s:'old'};
  const L=YEARL[iso]||{}; let tot=0, have=0, good=0;
  for(let y=Math.max(st.y0,1940);y<=st.y1;y++){ tot++; const c=L[y]; if(c){ have++; if((c.songs||[]).filter(x=>x[3]==='home'||x[3]==='charted').length>=6) good++; } }
  if(have&&good>=Math.ceil(tot*.8)) return {s:'year',have,tot};
  if(have) return {s:'sparse',have,tot};
  let dec=false; try{ for(let y=Math.max(st.y0,1940);y<=st.y1;y++) if(eraCell(iso,decadeKey(y))){ dec=true; break; } }catch(e){}
  return {s:dec?'decade':'none'}; }
// read the prompt for a place and time by setting the site's place and time for a moment, then putting them back; nothing is redrawn
// a life journey never plays the same seed twice: each stop skips what the stops before it used
let SKC={sig:'',seeds:{}};
function lifeSkip(st){ if(st.leg==null||J.kind!=='life') return null; const sig=JSON.stringify([J.life.legs,J.life.cut,J.life.carry,PMODE,PLANG,typeof NMODE!=='undefined'?NMODE:'']);
  if(SKC.sig!==sig) SKC={sig,seeds:{}};
  const items=lifeStops().items, skip=new Set();
  for(const x of items){ if(x.k===st.k) break; if(!SKC.seeds[x.k]) SKC.seeds[x.k]=placePrompt(x,new Set(skip)).seeds; SKC.seeds[x.k].forEach(k=>skip.add(k)); }
  return skip; }
function placePrompt(st,skip){ const sv=[STP,STYf,STFROM,STSPAN,PMODE,STROLE,STSKIP], t=timeSpec(st.y0,st.y1);
  if(skip===undefined) skip=lifeSkip(st);
  try{ STP=clean(st.pl); if(st.carry) PMODE='home'; STROLE=st.role||null; STSKIP=skip&&skip.size?skip:null; setYear(t.year); if(t.from!=null) setStay('from',t.from); else setStay(t.span);
    const pr=stPrompt(), iso=placeIso();
    return {txt:pr.txt, seeds:(pr.seeds||[]).map(x=>skKey(x[0],x[1])), row:{key:[iso||placeName(),STY,STSPAN,STFROM,PMODE].join('|'),place:placeName(),iso:iso||null,reg:plReg(st.pl),year:STY,span:STSPAN,from:STFROM,when:stWhen(),mode:PMODE,pl:clean(st.pl)}}; }
  finally{ STP=sv[0]; setYear(sv[1]); STFROM=sv[2]; STSPAN=sv[3]; PMODE=sv[4]; STROLE=sv[5]; STSKIP=sv[6]; } }
function openPlace(st){ const t=timeSpec(st.y0,st.y1); resetFilters('all'); setYear(t.year); if(t.from!=null) setStay('from',t.from); else setStay(t.span);
  stPanelOpen=true; setPlace(clean(st.pl)); if(curView()==='map') showView('map'); else location.hash='map'; }

/* ---------- movement stops ---------- */
const gStop=(id,x)=>({t:'g',id,k:'g:'+id,...(x||{})});
// 132 newer movements have no definition or playlist yet ("pending"): promptFor() cannot write theirs, so they get the bare template
function movPrompt(id){ try{ return promptFor(id); }catch(e){ const n=byId[id], B=usesB(id);
    return (B?PROMPT_B:PROMPT_A).replace('[GENRE]',`${n.name} (${n.place}, ${fmtYear(n.year).replace('c. ','from about ')})`)
      .replace('Below are intro and peak tracks to set out from. Play as many of them as feel right, but they are only the first steps: fill','Fill')
      .replace('Below are recordings to set out from. Play as many of them as feel right, then go well beyond them and let','Let'); } }
const plSt=id=>PL[id]?(PL[id].status||'thin'):'pending';
function people(){ let hg=new Set(), tr=new Set(), hk=new Set(), t=null;
  try{ const p=P(); if(p&&!p.isGuest()){ hg=p.heardGenres(); tr=p.travelled(); p.history().forEach(e=>{ if(e.kind==='trip'&&e.status!=='never'&&e.key) hk.add(e.key); }); t=p.taste(); } }catch(e){}
  const any=t&&(Object.keys(t.reg).length||Object.keys(t.band).length);
  // loved regions and families rank a little higher, ones left early a little lower
  const nudge=any?id=>{ const n=byId[id]; return Math.max(-.6,Math.min(.6,.15*(t.band[n.band]||0)+.08*(t.reg[n.reg]||0))); }:null;
  return {hg,tr,hk,nudge}; }
function pool(pp){ const fa=fActive(); return N.filter(n=>(!fa||inF(n.id))&&!(J.hide&&pp.hg.has(n.id))); }
const whyEmpty=pp=>fActive()?'The site filters exclude every movement, so there is nothing to walk through. Clear the filters, or loosen them on another tab.'
  :(J.hide&&pp.hg.size?'You have already heard everything here. Untick "Hide what I have already heard" to see it again.':'Nothing to list.');

/* ---------- 1. a life ---------- */
const CUTS=[['auto','Every 5 years (short legs whole)'],['1','Every year'],['3','Every 2–3 years'],['5','Every 5 years'],['10','Every decade'],['leg','One stop per leg']];
function chunks(a,b,cut){ if(b<a){ const x=a; a=b; b=x; }
  const step=cut==='auto'?((b-a)>5?5:0):cut==='leg'?0:(+cut||0);
  if(!step) return [[a,b]];
  const out=[];
  if(step===1){ for(let y=a;y<=b;y++) out.push([y,y]); return out; }
  if(step===3){ const L=b-a+1, n=Math.floor(L/3), r=L%3, sz=Array(n).fill(3); if(r===2) sz.push(2); else if(r===1){ if(n){ sz[n-1]=2; sz.push(2); } else sz.push(1); }
    let y=a; sz.forEach(k=>{ out.push([y,y+k-1]); y+=k; }); return out; }
  // on the calendar's own grid (1960–64, 1965–69; the 1960s), with a stub of a year or two joined to its neighbour
  for(let y=a;y<=b;){ const e=Math.min(b,Math.floor(y/step)*step+step-1); out.push([y,e]); y=e+1; }
  const stub=Math.floor(step/4), len=c=>c[1]-c[0]+1;
  if(out.length>1&&len(out[out.length-1])<=stub){ const l=out.pop(); out[out.length-1][1]=l[1]; }
  if(out.length>1&&len(out[0])<=stub){ const f=out.shift(); out[0][0]=f[0]; }
  return out; }
function lifeStops(){ const L=J.life, out=[]; let missing=0;
  const ok=g=>g.pl&&isFinite(Math.round(+g.from))&&(g.brief||isFinite(Math.round(+g.to)));
  const trips=L.legs.filter(g=>g.brief&&ok(g)).map(g=>Math.round(+g.from));
  const cOf=pl=>pl?(pl.k==='reg'?pl.reg:pl.iso):null;
  let prev=null;                                   // the last place lived in, for the music that came along
  const lived=new Set();                           // countries already lived in: coming back is not arriving as a newcomer
  L.legs.forEach((g,i)=>{ if(!ok(g)){ missing++; return; } const a=Math.round(+g.from), b=g.brief?a:Math.round(+g.to);
    if(g.brief){ out.push(pStop(g.pl,a,a,{leg:i,label:g.label||'brief trip',brief:true,ord:0,role:'visitor'})); return; }
    // a trip inside a stay splits the stay around it, so time never runs backwards
    const lo=Math.min(a,b), hi=Math.max(a,b), cuts=[...new Set(trips.filter(t=>t>lo&&t<hi))].sort((x,y)=>x-y), segs=[]; let s0=lo; cuts.forEach(t=>{ segs.push([s0,t]); s0=t; }); segs.push([s0,hi]);
    const moved=prev&&cOf(prev.pl)!==cOf(g.pl)&&prev.len>=3;
    segs.forEach(([x,y])=>chunks(x,y,L.cut).forEach(([y0,y1])=>{ out.push(pStop(g.pl,y0,y1,{leg:i,label:g.label||(moved&&!lived.has(cOf(g.pl))?'as a newcomer':''),brief:false,ord:1,role:moved&&!lived.has(cOf(g.pl))?'newcomer':null}));
      if(L.carry!==false&&moved){ const c=pStop(prev.pl,y0,y1,{leg:i,label:'still playing at home: what came along from '+plName(prev.pl,y0),carry:true,ord:2,role:'carry'}); c.k+='|carry'; out.push(c); } }));
    prev={pl:g.pl,len:hi-lo}; if(hi-lo>=3) lived.add(cOf(g.pl)); });
  out.sort((x,y)=>x.y0-y.y0||x.ord-y.ord||x.leg-y.leg||x.y1-y.y1);
  const seen={}; out.forEach(s=>{ if(seen[s.k]) s.k+='|'+s.leg; seen[s.k]=1; });
  if(L.birth!=null&&isFinite(L.birth)) out.forEach(s=>{ const a0=s.y0-L.birth, a1=s.y1-L.birth; if(a1>=0) s.age=a0===a1||a0<0?`age ${Math.max(0,a1)}`:`age ${a0}–${a1}`; });
  return {items:out, empty:!L.legs.length?'No legs yet. Load one of the examples above and edit it, or add a leg: a place, the years lived there, in the order they happened.'
    :(!out.length?'Each leg needs a place and years before it can become stops.':''), note:missing?`${missing} leg${missing>1?'s':''} without a place or years left out.`:''}; }
const EX={
  gp:{label:'Grandparents: Sweden to Canada',birth:1935,legs:[['cty:SE',1935,1971],['cty:CA',1971,1995]]},
  jc:{label:'Japan and Canada, with trips',birth:1990,legs:[['cty:JP',1990,2008],['cty:CA',2008,2012],['city:New York~US',2010,2010,1],['cty:JP',2012,2014],['city:Montreal~CA',2013,2013,1],['cty:CA',2014,2019],['city:Bali~ID',2016,2016,1]]} };
function loadExample(k){ const e=EX[k]; if(!e) return; state(); UNDO=JSON.stringify(J.life);
  J.life={title:e.label,birth:e.birth,cut:'auto',legs:e.legs.map(([p,a,b,br])=>({pl:parsePl(p),from:a,to:b,brief:!!br,label:br?'brief trip':''}))}; J.kind='life'; PK=null; save(); }
function lifeSet(){ const L=J.life;
  const legs=L.legs.map((g,i)=>`<div class="j4leg" data-leg="${i}"><span class="jn mono">${i+1}</span>${placeBtn('leg:'+i,g.pl,g.brief?g.from:g.to)}
    <span class="j4yrs"><input type="number" class="j4num" data-f="leg.from" min="${T0}" max="${T1}" step="1" value="${g.from}" aria-label="${g.brief?'Year':'From year'}">${g.brief?'':`<span>to</span><input type="number" class="j4num" data-f="leg.to" min="${T0}" max="${T1}" step="1" value="${g.to}" aria-label="To year">`}</span>
    <label class="jo"><input type="checkbox" data-f="leg.brief"${g.brief?' checked':''}> brief trip</label>
    <input type="text" class="j4txt" data-f="leg.label" maxlength="40" placeholder="Label (optional)" value="${esc(g.label||'')}" aria-label="Label">
    <span class="j4mv"><button type="button" class="lbtn" data-act="legup" title="Move up" aria-label="Move leg ${i+1} up"${i?'':' disabled'}>↑</button><button type="button" class="lbtn" data-act="legdn" title="Move down" aria-label="Move leg ${i+1} down"${i<L.legs.length-1?'':' disabled'}>↓</button><button type="button" class="lbtn" data-act="legrm" title="Remove" aria-label="Remove leg ${i+1}">✕</button></span>
    ${PK&&PK.tgt==='leg:'+i?pickerHtml():''}</div>`).join('');
  return `<div class="j4line"><span class="fine">Start from an example, then edit it:</span>${Object.keys(EX).map(k=>`<button type="button" class="lbtn" data-act="ex" data-ex="${k}">${esc(EX[k].label)}</button>`).join('')}${UNDO?'<button type="button" class="lbtn" data-act="undo">Undo</button>':''}</div>
  <div class="j4line"><label class="jo">Whose journey <input type="text" class="j4txt" data-f="life.title" maxlength="40" value="${esc(L.title||'')}" placeholder="Name (optional)"></label>
    <label class="jo">Born <input type="number" class="j4num" data-f="life.birth" min="${T0}" max="${T1}" step="1" value="${L.birth==null?'':L.birth}" placeholder="year" aria-label="Birth year (optional)"></label>
    <label class="jo"><input type="checkbox" data-f="life.carry"${L.carry!==false?' checked':''}> After a move, keep the old country's music playing alongside</label>
    <label class="jo">Stops <select data-f="life.cut">${CUTS.map(([v,l])=>`<option value="${v}"${v===L.cut?' selected':''}>${l}</option>`).join('')}</select></label></div>
  <div class="j4legs">${legs||'<p class="fine">No legs yet.</p>'}</div>
  <div class="j4line"><button type="button" class="lbtn" data-act="legadd">Add a leg</button>${L.legs.length?'<button type="button" class="lbtn" data-act="legclear">Clear all</button>':''}<span class="fine">The years in the examples are made up: change them to the real ones. The site filters do not limit a life.</span></div>`; }

/* ---------- 2. music history ---------- */
const CHAP=[[-1e9,1500,'before 1500'],[1500,1800,'1500–1800'],[1800,1900,'1800–1900'],[1900,1945,'1900–1945'],[1945,1970,'1945–1970'],[1970,1990,'1970–1990'],[1990,1e9,'1990 to now']];
const chron=(a,b)=>a.year-b.year||a.name.localeCompare(b.name);
function histStops(pp){ const all=pool(pp); if(!all.length) return {items:[],empty:whyEmpty(pp)};
  const rank=(a,b)=>SC[b.id][0]-SC[a.id][0]||SC[b.id][2]-SC[a.id][2]||SC[b.id][3]-SC[a.id][3]||a.year-b.year||a.id.localeCompare(b.id);
  // pass 1 is not the global top N (that is a history of US and UK pop): every region and every era gets a share, no country or lineage dominates
  const top=(function(){ const n=Math.min(J.hist.n,all.length), R=all.slice().sort(rank), pick=[], ids=new Set(), cC={}, cT={}, cB={}; let post=0;
    const cty=x=>(CNT[x.id]&&CNT[x.id][0])||x.reg, capC=Math.max(3,Math.round(n*.3)), capB=Math.max(3,Math.round(n/7)), capP=Math.round(n*.4);
    const ok=x=>!ids.has(x.id)&&(cC[cty(x)]||0)<capC&&(cT[TRAD_OF[x.id]||x.id]||0)<2&&(cB[x.band]||0)<capB&&(x.year<1945||post<capP);
    const add=x=>{ pick.push(x); ids.add(x.id); cC[cty(x)]=(cC[cty(x)]||0)+1; const t=TRAD_OF[x.id]||x.id; cT[t]=(cT[t]||0)+1; cB[x.band]=(cB[x.band]||0)+1; if(x.year>=1945) post++; };
    const fill=(want,test)=>{ for(const x of R){ if(pick.length>=n||pick.filter(test).length>=want) break; if(test(x)&&ok(x)) add(x); } };
    const per=Math.max(1,Math.floor(n/20));
    REGS.forEach(r=>fill(per,x=>x.reg===r));
    fill(Math.round(n/5),x=>x.year<1500); fill(Math.round(n/10),x=>x.year>=1500&&x.year<1800); fill(Math.round(n/5),x=>x.year>=1800&&x.year<1945);
    fill(n,()=>true); for(const x of R){ if(pick.length>=n) break; if(!ids.has(x.id)) add(x); }
    return pick; })(), ts=new Set(top.map(n=>n.id)), ro=r=>{ const i=REGS.indexOf(r); return i<0?99:i; }, rest=all.filter(n=>!ts.has(n.id)).sort((a,b)=>ro(a.reg)-ro(b.reg)||chron(a,b));
  const items=[{h:'Pass 1 · The essentials',sub:`${top.length} essentials, from the oldest to the newest: the most significant of every region and era, with no country or lineage allowed to crowd out the rest. The year of an oral tradition is when it is first attested; the music is older.`}, ...top.sort(chron).map(n=>gStop(n.id,{pass:1}))];
  CHAP.forEach(([a,b,l])=>{ const c=rest.filter(n=>n.year>=a&&n.year<b); if(c.length){ items.push({h:`Pass 2 · The niches · ${l}`,sub:`Back to the start for the rest: ${c.length} movement${c.length>1?'s':''} that began ${l==='before 1500'?l:'in '+l}, region by region.`}); c.forEach(n=>items.push(gStop(n.id,{pass:2,chap:l}))); } });
  return {items}; }
const histSet=()=>`<div class="j4line"><label class="jw">Essentials in pass 1 <input type="range" min="20" max="80" step="1" value="${J.hist.n}" data-f="hist.n"><span class="mono">${J.hist.n}</span></label></div>`;

/* ---------- 3. world traveller ---------- */
const DEPTHS=[[3,'3'],[5,'5'],[8,'8'],['all','Until I say']];
const LAPSUB=['First visit: the best-known sound first, then through time, across several countries.','Back for more depth: the next most significant.','Deeper still.'];
const ctyOf=r=>{ const c={}; N.forEach(n=>{ if(n.reg===r&&CNT[n.id]&&CNT[n.id][0]&&isoReg(CNT[n.id][0])===r) c[CNT[n.id][0]]=(c[CNT[n.id][0]]||0)+1; }); return Object.keys(c).sort((a,b)=>isoName(a).localeCompare(isoName(b))).map(i=>[i,c[i]]); };
// (country, decade) pairs with year-by-year hit lists: the well-researched destinations of a region
function pairsOf(r,iso,pp){ const isos=Object.keys(YEARL).filter(i=>ISO[i]&&isoReg(i)===r&&(!iso||i===iso)).sort((a,b)=>Object.keys(YEARL[b]).length-Object.keys(YEARL[a]).length||a.localeCompare(b));
  const per=isos.map(i=>{ const d={}; Object.keys(YEARL[i]).forEach(y=>{ const k=Math.floor(+y/10)*10; d[k]=(d[k]||0)+1; }); return Object.keys(d).filter(k=>d[k]>=4).map(Number).sort((a,b)=>a-b).map(k=>[i,k]); });
  const out=[]; for(let j=0;per.some(L=>j<L.length);j++) per.forEach(L=>{ if(L[j]) out.push(L[j]); });
  const fa=fActive(), [f0,f1]=stRange();
  return out.filter(([i,d])=>{ const y1=Math.min(d+9,NOWY); if(J.hide&&pp.tr.has(i+'_'+d)) return false; if(!fa) return true;
    if(FG||FTM==='made'||FPL==='made') return false; if(STP&&!placeInside({k:'cty',iso:i},STP)) return false; return d<=f1&&y1>=f0; }); }
function travStops(pp){ const T=J.trav, regs=T.order.filter(r=>!T.off.includes(r));
  if(!regs.length) return {items:[],empty:'No regions chosen. Tick at least one region in the route above.'};
  // significance leads, easier listening first among equals; movements still without seed songs wait a little
  const all=pool(pp), score=id=>SC[id][0]+.3*SC[id][1]+.15*SC[id][2]-(DEFS[id]?0:.6)+(pp.nudge?pp.nudge(id):0);
  const lists={}, ptr={}, pr={}, pptr={}, usedT={};
  regs.forEach(r=>{ const iso=T.narrow[r]||null; lists[r]=all.filter(n=>n.reg===r&&(!iso||(CNT[n.id]&&CNT[n.id][0]===iso))).map(n=>n.id).sort((a,b)=>score(b)-score(a)||byId[a].name.localeCompare(byId[b].name)); ptr[r]=0; pr[r]=T.mix?pairsOf(r,iso,pp):[]; pptr[r]=0; });
  const laps=T.depth==='all'?1:(T.laps?3:1), items=[], home=T.mode==='home'&&T.home?T.home:null; let nv=0, hn=0;
  for(let lap=0;lap<laps;lap++) regs.forEach(r=>{ const vk=lap+':'+r, L=lists[r], left=L.length-ptr[r];
    const pair=pr[r][pptr[r]]||null; if(left<=0&&!pair) return;
    const take=T.depth==='all'?left:(+T.depth+(T.extra[vk]||0)), nm=Math.min(left,pair&&T.depth!=='all'&&take>1?take-1:take);
    // a visit is a place, not a chart: several countries, at most two stops per country and per lineage, something with old roots; the hook first, then in time order
    const U=usedT[r]=usedT[r]||new Set(), remL=L.filter(id=>!U.has(id)), cOf=id=>(CNT[id]&&CNT[id][0])||'?', ids=[], cc={}, tt={};
    const can=(id,strict)=>!ids.includes(id)&&(cc[cOf(id)]||0)<(strict?1:2)&&(tt[TRAD_OF[id]||id]||0)<(strict?1:2);
    const put=id=>{ ids.push(id); cc[cOf(id)]=(cc[cOf(id)]||0)+1; const t=TRAD_OF[id]||id; tt[t]=(tt[t]||0)+1; };
    if(T.depth==='all') remL.slice(0,nm).forEach(put);
    else{ for(const id of remL){ if(ids.length>=Math.min(nm,3)) break; if(can(id,lap===0)) put(id); }
      for(const id of remL){ if(ids.length>=nm) break; if(can(id,false)) put(id); }
      for(const id of remL){ if(ids.length>=nm) break; if(!ids.includes(id)) put(id); }
      if(ids.length>=3&&!ids.some(id=>byId[id].year<1900)){ const old=remL.find(id=>byId[id].year<1900&&!ids.includes(id)); if(old) ids[ids.length-1]=old; }
      const hook=ids[0], restIds=ids.slice(1).sort((a,b)=>byId[a].year-byId[b].year); ids.length=0; ids.push(hook,...restIds.filter(x=>x!=null)); if(hook==null) ids.length=0; }
    ids.forEach(id=>U.add(id)); ptr[r]=U.size;
    const stops=ids.map(id=>gStop(id,{vk}));
    if(pair&&T.depth!=='all'&&ids.some(id=>(CNT[id]&&CNT[id][0])===pair[0])){ const alt=pr[r].slice(pptr[r]).find(q=>!ids.some(id=>(CNT[id]&&CNT[id][0])===q[0])); if(alt){ const ai=pr[r].indexOf(alt); pr[r].splice(ai,1); pr[r].splice(pptr[r],0,alt); } }
    const pair2=pr[r][pptr[r]]||null;
    if(pair2){ pptr[r]++; const [iso,d]=pair2; stops.splice(Math.min(2,stops.length),0,pStop({k:'cty',iso},d,Math.min(d+9,NOWY),{vk,label:'well-researched destination'})); }
    if(!stops.length) return;
    if(home&&nv){ hn++; items.push({h:'Home',sub:'Back home between trips, at the present.',small:1}); items.push({...pStop(home,NOWY,NOWY,{label:'home'}),k:'p:home|'+hn}); }
    nv++;
    const more=T.depth!=='all'&&(L.length-ptr[r]>0), skipped=!!T.skip[vk];
    items.push({h:regName[r]+(T.narrow[r]?' · '+isoName(T.narrow[r]):'')+(laps>1?` · visit ${lap+1}`:''),sub:T.depth==='all'?'Everything from here, the most significant first. Press Move on when you have had enough.':LAPSUB[lap],vk,more,skipped,reg:r,n:stops.length});
    stops.forEach(s=>{ s.more=more; if(skipped&&!J.done[s.k]) s.skip=true; items.push(s); }); });
  if(!items.some(i=>!i.h||false)) return {items:[],empty:all.length?'Nothing in the chosen regions fits.':whyEmpty(pp)};
  return {items}; }
function travSet(){ const T=J.trav, seg=(f,cur,opts)=>`<span class="seg j4seg" role="group">${opts.map(([v,l])=>`<button type="button" data-act="set" data-f="${f}" data-v="${v}" aria-pressed="${String(cur)===String(v)}">${l}</button>`).join('')}</span>`;
  const rows=T.order.map((r,i)=>{ const on=!T.off.includes(r), cs=ctyOf(r);
    return `<div class="j4reg${on?'':' off'}" data-reg="${r}"><span class="jn mono">${i+1}</span><label class="jo j4rname"><input type="checkbox" data-f="trav.on"${on?' checked':''}><i class="jdot" style="background:${regColor(r)}"></i>${esc(regName[r])}</label>
      <select data-f="trav.narrow" aria-label="Narrow ${esc(regName[r])} to a country"><option value="">Whole region</option>${cs.map(([c,n])=>`<option value="${c}"${T.narrow[r]===c?' selected':''}>${esc(isoName(c))} (${n})</option>`).join('')}</select>
      <span class="j4mv"><button type="button" class="lbtn" data-act="regup" aria-label="Move ${esc(regName[r])} earlier"${i?'':' disabled'}>↑</button><button type="button" class="lbtn" data-act="regdn" aria-label="Move ${esc(regName[r])} later"${i<T.order.length-1?'':' disabled'}>↓</button></span></div>`; }).join('');
  return `<div class="j4line"><span class="j4lab">Stops per visit</span>${seg('trav.depth',T.depth,DEPTHS)}</div>
  <div class="j4line"><span class="j4lab">Between regions</span>${seg('trav.mode',T.mode,[['cont','One continuous journey'],['home','Return home between trips']])}
    ${T.mode==='home'?`<span class="j4lab">Home</span>${placeBtn('home',T.home,NOWY)}${PK&&PK.tgt==='home'?pickerHtml():''}`:''}</div>
  <div class="j4line"><label class="jo"><input type="checkbox" data-f="trav.laps"${T.laps?' checked':''}${T.depth==='all'?' disabled':''}> Come back later for more depth (three laps)</label>
    <label class="jo"><input type="checkbox" data-f="trav.mix"${T.mix?' checked':''}> Include well-researched places and years</label>
    <button type="button" class="lbtn" data-act="travreset">Reset route</button></div>
  <details class="j4route"${T.ro?' open':''}><summary>Order of regions <span class="fine">${T.order.filter(r=>!T.off.includes(r)).map(r=>esc(regName[r])+(T.narrow[r]?' ('+esc(isoName(T.narrow[r]))+')':'')).join(' → ')||'none chosen'}</span></summary><div class="j4regs">${rows}</div></details>`; }

/* ---------- 4. discovery walk: the original greedy order, limited to the filtered pool and nudged by taste ---------- */
function discOrder(ids,nudge){ const W=J.disc.w, O=J.disc.o, ws=W.S+W.A+W.F+W.I||1;
  const base=id=>{ const [S,A,F,I]=SC[id]; return (W.S*S+W.A*A+W.F*F+W.I*I)/ws; };
  const rem=new Set(ids), seq=[], cyc=['home','abroad','past']; let load=1.5; const lastBands=[], lastRegs=[];
  while(rem.size){ const phase=cyc[seq.length%3]; let best=null, bv=-1e9;
    const bc6={}, rc6={}; lastBands.slice(-6).forEach(b=>bc6[b]=(bc6[b]||0)+1); lastRegs.slice(-6).forEach(r=>rc6[r]=(rc6[r]||0)+1);
    for(const id of rem){ const n=byId[id], A=SC[id][1], diff=6-A; let v=base(id);
      if(phaseOf(id)===phase) v+=1.3;
      const bc=bc6[n.band]||0; v+= bc? -0.55*bc : 0.4;
      const rc=rc6[n.reg]||0; v+= rc? -0.45*rc : 0.3;
      if(O.knownLast && KNOWN.has(id)) v-=1.6;
      if(load+0.45*(diff-load)>3.1 && A<=3) v-=2.2;
      if(O.roots){ const p=n.parents[0]; if(p && rem.has(p) && base(p)>=base(id)-0.6) v-=0.5; }
      if(nudge) v+=nudge(id);
      if(v>bv){ bv=v; best=id; } }
    seq.push(best); rem.delete(best); load=load+0.45*((6-SC[best][1])-load); lastBands.push(byId[best].band); lastRegs.push(byId[best].reg); }
  return seq; }
function discStops(pp){ const all=pool(pp); if(!all.length) return {items:[],empty:whyEmpty(pp)};
  return {items:discOrder(all.map(n=>n.id),pp.nudge).map(id=>gStop(id,{bars:1}))}; }
function discSet(){ const lab={S:'Significance',A:'Easy listening',F:'Well known',I:'Intrigue'}, W=J.disc.w, O=J.disc.o;
  return `<div class="j4line jctl">${Object.keys(lab).map(k=>`<label class="jw">${lab[k]}<input type="range" min="0" max="10" step="1" value="${W[k]}" data-f="disc.w" data-w="${k}"><span class="mono">${W[k]}</span></label>`).join('')}</div>
  <div class="j4line"><label class="jo"><input type="checkbox" data-f="disc.knownLast"${O.knownLast?' checked':''}> Genres I already know go last</label>
    <label class="jo"><input type="checkbox" data-f="disc.roots"${O.roots?' checked':''}> Roots before branches</label>
    <button type="button" class="lbtn" data-act="discreset">Reset weights</button></div>`; }

/* ---------- 0. the course (proposal docs/proposals/2026-11-24-journeys-and-course.md, decision D25) ----------
   Chapters are eras. A chapter's stops are the most significant genres that began in the era, among those with a
   sourced definition and a playable list, with at most two per region and one per tradition, in order of date.
   Everything shown about a stop comes from its record: nothing is written here about the music itself. */
const CERA=[[-1e9,1000,'Before 1000'],[1000,1600,'1000 to 1600'],[1600,1800,'1600 to 1800'],[1800,1900,'1800 to 1900'],[1900,1930,'1900 to 1930'],[1930,1950,'1930 to 1950'],[1950,1965,'1950 to 1965'],[1965,1980,'1965 to 1980'],[1980,1995,'1980 to 1995'],[1995,2010,'1995 to 2010'],[2010,1e9,'2010 to now']];
const CPER=6; let CZ=null;
function course(){ if(CZ) return CZ;
  const ok=n=>DEFS[n.id]&&DEFS[n.id].sound&&PL[n.id]&&plSt(n.id)!=='none'&&plSt(n.id)!=='pending';
  const rank=(a,b)=>SC[b.id][0]-SC[a.id][0]||SC[b.id][2]-SC[a.id][2]||a.year-b.year||a.id.localeCompare(b.id);
  CZ=CERA.map(([a,b,title],i)=>{ const c=N.filter(n=>n.year>=a&&n.year<b&&ok(n)).sort(rank), pick=[], cr={}, ct={};
    for(const n of c){ if(pick.length>=CPER) break; const t=TRAD_OF[n.id]||n.id; if((cr[n.reg]||0)>=2||ct[t]) continue; pick.push(n); cr[n.reg]=(cr[n.reg]||0)+1; ct[t]=1; }
    for(const n of c){ if(pick.length>=Math.min(CPER,3)) break; if(!pick.includes(n)) pick.push(n); }   // a thin era still gets up to three
    return {i,title,ids:pick.sort(chron).map(n=>n.id),pool:c.length}; }).filter(ch=>ch.ids.length);
  return CZ; }
const czDone=(id,pp)=>!!J.done['g:'+id]||pp.hg.has(id);
const czWhere=id=>course().findIndex(ch=>ch.ids.includes(id));
function courseHtml(){ const C=course(), pp=people(), ch=J.course.ch!=null?C[J.course.ch]:null;
  const total=C.reduce((s,c)=>s+c.ids.length,0), doneAll=C.reduce((s,c)=>s+c.ids.filter(id=>czDone(id,pp)).length,0);
  if(!ch){ const next=C.find(c=>c.ids.some(id=>!czDone(id,pp)));
    return `<div class="czhead"><div class="czbar"><i style="width:${total?Math.round(100*doneAll/total):0}%"></i></div><p class="fine"><b>${doneAll}</b> of ${total} stops heard · ${C.length} chapters</p></div>
      <div class="rows czlist">${C.map((c,k)=>{ const d=c.ids.filter(id=>czDone(id,pp)).length, all=d===c.ids.length;
        return `<button type="button" class="rowb czch${all?' all':''}" data-czch="${k}"><span class="cznum">${all?UI.ic('check'):k+1}</span><span class="rmain"><b>${esc(c.title)}</b><small>${esc(c.ids.map(id=>byId[id].name).join(' · '))}</small></span><span class="czcount">${c===next&&d<c.ids.length?`<i class="czgo">${d?'Continue':'Start'}</i>`:`${d}/${c.ids.length}`}</span><span class="rchev">${UI.ic('chev')}</span></button>`; }).join('')}</div>
      <p class="fine">Chapters are eras; a stop belongs to the era it began in. The year of an oral tradition is when it is first attested: the music is older. Stops are picked by the significance scores in the data, at most two per region in a chapter.</p>`; }
  const k=J.course.ch, d=ch.ids.filter(id=>czDone(id,pp)).length;
  const rel=(label,ids)=>ids.length?`<span class="czrel"><em>${label}</em> ${ids.map(x=>`<a href="#journey" data-czrel="${x}">${esc(byId[x].name)}</a>`).join(', ')}</span>`:'';
  return `<div class="cztop"><button type="button" class="lbtn" data-czch="-1">${UI.ic('chev')}<span>Chapters</span></button><span class="fine">${d} of ${ch.ids.length} heard</span></div>
    <h3 class="cztitle"><small>Chapter ${k+1}</small>${esc(ch.title)}</h3>
    ${ch.ids.map((id,j)=>{ const n=byId[id], D=DEFS[id], done=czDone(id,pp), par=(n.parents||[]).filter(x=>byId[x]).slice(0,3), kids=N.filter(x=>(x.parents||[]).includes(id)).sort((a,b)=>SC[b.id][0]-SC[a.id][0]).slice(0,3).map(x=>x.id);
      return `<article class="czs${done?' done':''}" data-czs="${id}"><header><span class="czn">${j+1}</span><span class="czt"><b>${esc(n.name)}</b><small><i class="jdot" style="background:${regColor(n.reg)}"></i>${esc(D.window||fmtY(n.year))} · ${esc(n.place)}</small></span><button type="button" class="cztick" data-cztick="${id}" aria-pressed="${done}" aria-label="${done?'Heard':'Mark as heard'}">${UI.ic('check')}</button></header>
        <p class="czsound">${esc(D.sound)}</p>
        ${(D.markers||[]).length?`<p class="czlab">Listen for</p><ul class="czmk">${D.markers.slice(0,4).map(m=>`<li>${esc(m)}</li>`).join('')}</ul>`:''}
        ${par.length||kids.length?`<p class="czrels">${rel('On the tree, it follows',par)}${rel('It leads to',kids)}</p>`:''}
        ${(D.fits||[]).length?`<p class="czlab">Start with</p><ol class="czfits stlinks">${D.fits.slice(0,3).map(f=>songLi(f[0],f[1])).join('')}</ol>`:''}
        <div class="czact"><button type="button" class="lbtn primary" data-czplay="${id}">Open the playlist</button></div></article>`; }).join('')}
    <div class="czend">${k+1<C.length?`<button type="button" class="lbtn primary" data-czch="${k+1}">Next: ${esc(C[k+1].title)}</button>`:`<p class="fine">That is the last chapter. The other kinds of journey above go wider.</p>`}</div>`; }

/* ---------- build, render ---------- */
let CUR={items:[]};
function build(kind){ state(); const pp=people(), k=kind||J.kind;
  const r=k==='life'?lifeStops():k==='hist'?histStops(pp):k==='trav'?travStops(pp):discStops(pp);
  let n=0; r.items.forEach(s=>{ if(s.h) return; if(!s.skip) s.n=++n;
    s.done=!!J.done[s.k]; s.heard=s.t==='g'?pp.hg.has(s.id):pp.hk.has(histKey(s)); });
  r.kind=k; return r; }
function filterLine(){ if(J.kind==='life'||!fActive()) return '';
  const parts=[]; if(STP) parts.push(`${placeName()} (${FPL==='made'?'made there':'heard there'})`);
  if(!timeIsDefault()||FTM==='made'){ const [a,b]=stRange(); parts.push((STFROM===T0?`up to ${fmtY(STY)}`:a===b?fmtY(a):`${fmtY(a)}–${fmtY(b)}`)+(FTM==='made'?' (born then)':'')); }
  if(FG) parts.push(fgName());
  let n=0; N.forEach(x=>{ if(inF(x.id)) n++; });
  return `<p class="j4filt">Limited by the site filters: <b>${esc(parts.join(' · '))}</b> <span class="fine">${n} of ${N.length} movements</span> <button type="button" class="lbtn" data-act="clearf">Clear filters</button></p>`; }
const RTAG={year:['well-researched','Hit lists for each year of this stop, from published charts'],sparse:['sparse','Only some years of this stop have sourced hit lists; the rest comes from the decade list or the sounds alive there'],
  decade:['decade list','No year-by-year research yet: seed songs come from a list for the whole decade'],none:['not researched','No song list for this place and time yet: seed songs come from the sounds alive there'],old:['before the charts','Before 1940 there are no hit lists: seed pieces come from the sounds alive there']};
function rowHtml(s,next){ const tags=[]; let dot, name, meta, act='';
  if(s.t==='g'){ const n=byId[s.id], d=DEFS[s.id], ps=plSt(s.id); dot=regColor(n.reg); name=n.name; meta=`${d?d.window:fmtYear(n.year)} · ${n.place}`;
    if(ps==='pending') tags.push('<span class="jt j4pend" title="No definition or playlist yet: the prompt has no seed songs">pending</span>');
    else if(ps==='none') tags.push('<span class="jt jt-none" title="No real playlist: listen to the albums in its List entry">album listen</span>');
    else if(ps==='thin') tags.push('<span class="jt" title="Few recordings on streaming; the list is short">thin</span>');
    if(d&&usesB(s.id)) tags.push('<span class="jt" title="Uses the tradition prompt, not the time-machine prompt">tradition prompt</span>');
    act=ps==='none'?'<button class="jcopy" type="button" data-act="albums">See albums</button>':'<button class="jcopy" type="button" data-act="copy">Copy prompt</button>';
  } else { const r=research(s), reg=plReg(s.pl); dot=reg?regColor(reg):'var(--muted)'; name=plName(s.pl,s.y1); meta=whenTxt(s.y0,s.y1)+(s.age?` · ${s.age}`:'');
    if(s.label) tags.push(`<span class="jt j4lbl">${esc(s.label)}</span>`);
    if(r) tags.push(`<span class="jt j4r-${r.s}" title="${RTAG[r.s][1]}${r.tot?` (${r.have} of ${r.tot} years)`:''}">${RTAG[r.s][0]}</span>`);
    act='<button class="jcopy" type="button" data-act="copy">Copy prompt</button>'; }
  if(s.heard) tags.push('<span class="jt j4heard" title="In your travels: you already copied this one">heard</span>');
  const shown=SHOWN&&SHOWN.k===s.k;
  return `<div class="j4row${s.done?' done':''}${s.heard?' heard':''}${next?' next':''}" data-k="${esc(s.k)}"><span class="jn mono">${s.n}</span><input type="checkbox" class="j4done"${s.done?' checked':''} aria-label="Mark ${esc(name)} as done" title="Done">
    <i class="jdot" style="background:${dot}"></i><span class="j4what"><span class="jname">${esc(name)}</span> <span class="jmeta">${esc(meta)}</span>${next?' <span class="j4next">next up</span>':''}</span>
    ${tags.length?`<span class="jtags">${tags.join('')}</span>`:''}${s.bars?`<span class="jbars">${bars(s.id)}</span>`:''}
    <span class="j4act">${act}<button class="jcopy" type="button" data-act="open" title="${s.t==='g'?'Select it and show it in the List':'Go to the map at this place and time'}">Open</button>${next&&s.vk?`${s.more?'<button class="jcopy" type="button" data-act="more" title="Add three more stops from this region to this visit">More from here</button>':''}<button class="jcopy" type="button" data-act="moveon" title="Skip the rest of this visit">Move on</button>`:''}</span>
    ${shown?`<div class="j4prompt"><textarea readonly rows="8" aria-label="Prompt">${esc(SHOWN.txt)}</textarea><p class="fine"><span class="mono">${SHOWN.txt.length}</span> characters (Spotify's limit is 2,000) <button type="button" class="lbtn" data-act="hideprompt">Hide</button></p></div>`:''}</div>`; }
function headHtml(h){ return `<div class="j4h${h.small?' small':''}${h.skipped?' skipped':''}"${h.vk?` data-vk="${h.vk}"`:''}><h3>${esc(h.h)}</h3><span class="fine">${esc(h.sub||'')}${h.skipped?' You moved on from here.':''}</span>${h.vk?`<span class="j4act">${h.skipped?'<button class="jcopy" type="button" data-act="unskip">Stay after all</button>':`${h.more?'<button class="jcopy" type="button" data-act="more">More from here</button>':''}<button class="jcopy" type="button" data-act="moveon">Move on</button>`}</span>`:''}</div>`; }
function renderList(){ const r=CUR=build(), stops=r.items.filter(s=>!s.h&&!s.skip), next=stops.find(s=>!s.done&&!s.heard), doneN=stops.filter(s=>s.done).length, heardN=stops.filter(s=>s.heard&&!s.done).length;
  const el=id=>root.querySelector('#'+id);
  el('j4filt').innerHTML=filterLine();
  const title=r.kind==='life'&&J.life.title?`<b>${esc(J.life.title)}</b> · `:'';
  el('j4prog').innerHTML=stops.length?`${title}<b>${doneN}</b> of ${stops.length} stops done${heardN?` · ${heardN} more already heard`:''}`+(next?` · next up: <a href="#journey" data-act="gonext">${esc(next.t==='g'?byId[next.id].name:plName(next.pl,next.y1)+' '+whenTxt(next.y0,next.y1))}</a>`:' · all done')+(r.note?` · ${esc(r.note)}`:''):(r.note?esc(r.note):'');
  let html='', shownRows=0;
  r.items.forEach(s=>{ if(s.h){ html+=headHtml(s); return; } if(s.skip) return; if(J.hide&&(s.done||s.heard)&&s!==next) return; shownRows++; html+=rowHtml(s,s===next); });
  if(!stops.length) html=`<p class="j4empty">${esc(r.empty||'Nothing to list.')}</p>`;
  else if(!shownRows) html+=`<p class="j4empty">Every stop is done or already heard, and those are hidden. Untick "Hide what I have already heard" to see them.</p>`;
  el('j4list').innerHTML=html; }
function renderSet(){ const k=J.kind;
  root.querySelectorAll('.j4kind button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===k)));
  root.querySelector('#j4intro').textContent=INTRO[k];
  root.querySelector('#j4set').innerHTML=`<details class="j4box"${J.open?' open':''}><summary>${k==='life'?'Legs of the journey':k==='trav'?'Route and settings':'Settings'}</summary><div class="j4body">${k==='life'?lifeSet():k==='hist'?histSet():k==='trav'?travSet():discSet()}
    <div class="j4line"><label class="jo"><input type="checkbox" data-f="hide"${J.hide?' checked':''}> Hide what I have already heard</label><span class="fine">${pid()==='guest'?'Travelling as a guest: ticks stay on this device and copies are not kept. Sign in from the round account button to keep a history.':'Ticks, settings and copied prompts are kept under your name.'}</span></div></div></details>`; }
function render(){ try{ state(); if(!root.querySelector('#j4list')){
      root.innerHTML=`<div class="seg j4kind" role="group" aria-label="Kind of journey">${KINDS.map(([k,l])=>`<button type="button" data-kind="${k}" aria-pressed="false">${l}</button>`).join('')}</div>
        <p class="jintro" id="j4intro"></p><div id="j4set"></div><div id="j4filt"></div><p class="fine" id="j4prog" aria-live="polite"></p><div id="j4list"></div>`; }
    const cz=J.kind==='course'; ['j4set','j4filt','j4prog'].forEach(id=>{ root.querySelector('#'+id).hidden=cz; });
    if(cz){ root.querySelectorAll('.j4kind button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind==='course'))); root.querySelector('#j4intro').textContent=J.course.ch==null?INTRO.course:''; root.querySelector('#j4intro').hidden=J.course.ch!=null; root.querySelector('#j4list').innerHTML=courseHtml(); return; }
    root.querySelector('#j4intro').hidden=false;
    renderSet(); renderList(); }catch(e){ console.error('journey',e); const L=root.querySelector('#j4list'); if(L) L.innerHTML='<p class="j4empty">The journey could not be drawn. Try another kind of journey.</p>'; } }

/* ---------- actions ---------- */
const stopOf=k=>CUR.items.find(s=>!s.h&&s.k===k);
function doCopy(k){ const s=stopOf(k); if(!s) return; let txt, info;
  if(s.t==='g'){ const n=byId[s.id]; txt=movPrompt(s.id); info={gid:s.id,key:s.id,place:n.place,reg:n.reg,year:n.year}; }
  else{ const r=placePrompt(s); txt=r.txt; info=r.row; }
  SHOWN={k,txt};
  try{ logCopy('journey',info); }catch(e){}          // for a signed-in person this adds the history row and redraws the list
  renderList();
  const row=[...root.querySelectorAll('.j4row')].find(x=>x.dataset.k===k); if(!row) return;
  copyText(row.querySelector('[data-act="copy"]'),txt,row.querySelector('textarea')); }
function doOpen(k){ const s=stopOf(k); if(!s) return;
  if(s.t==='g'){ select(s.id); if(curView()==='list') showView('list'); else location.hash='list'; } else openPlace(s); }
function setDone(k,on){ if(on) J.done[k]=1; else delete J.done[k];
  if(JPID==='guest'&&k.startsWith('g:')){ try{ const id=k.slice(2); if(on) DONE.add(id); else DONE.delete(id); saveJ(); }catch(e){} }
  save(); renderList(); }
function swap(a,i,j){ if(j<0||j>=a.length) return; const x=a[i]; a[i]=a[j]; a[j]=x; }
root.addEventListener('click',e=>{ const cz=e.target.closest('[data-czch],[data-cztick],[data-czplay],[data-czrel]');
  if(cz&&!e.target.closest('.stplay')){ state(); const d=cz.dataset, tr=(a,x)=>{ try{ window.TRACK&&window.TRACK('course',Object.assign({a},x)); }catch(_){} };
    if(d.czch!=null){ J.course.ch=+d.czch<0?null:+d.czch; save(); render(); root.scrollIntoView&&window.scrollTo(0,0); const m=document.querySelector('main')||document.scrollingElement; try{ root.closest('.view,section,main').scrollTop=0; }catch(_){} tr('chapter',{ch:J.course.ch}); }
    else if(d.cztick){ setDone('g:'+d.cztick,!J.done['g:'+d.cztick]); render(); tr('tick',{id:d.cztick}); }
    else if(d.czplay){ if(!J.done['g:'+d.czplay]){ J.done['g:'+d.czplay]=1; save(); } tr('play',{id:d.czplay}); openGenrePlaylist(d.czplay); render(); }
    else if(d.czrel){ e.preventDefault(); const w=czWhere(d.czrel); if(w>=0){ J.course.ch=w; save(); render(); const el=root.querySelector(`[data-czs="${d.czrel}"]`); if(el) el.scrollIntoView({block:'start'}); } else { select(d.czrel); location.hash='list'; } }
    return; }
  const kb=e.target.closest('.j4kind button'); if(kb){ state(); J.kind=kb.dataset.kind; PK=null; SHOWN=null; save(); render(); return; }
  const pk=e.target.closest('[data-pk]'); if(pk&&PK){ const p=parsePl(pk.dataset.pk); if(p){ if(PK.tgt==='home') J.trav.home=p; else{ const g=J.life.legs[+PK.tgt.slice(4)]; if(g) g.pl=p; } } PK=null; save(); render(); return; }
  const b=e.target.closest('[data-act]'); if(!b) return; const a=b.dataset.act, row=b.closest('.j4row'), k=row&&row.dataset.k; state();
  if(a==='gonext'){ e.preventDefault(); const r=root.querySelector('.j4row.next'); if(r) r.scrollIntoView({block:'center',behavior:'smooth'}); return; }
  if(a==='copy'){ doCopy(k); return; }
  if(a==='open'){ doOpen(k); return; }
  if(a==='albums'){ const s=stopOf(k); if(!s) return; select(s.id); location.hash='list'; setTimeout(()=>{ const pl=document.querySelector(`#g-${s.id} .pl`); if(pl) pl.open=true; },300); return; }
  if(a==='hideprompt'){ SHOWN=null; renderList(); return; }
  if(a==='clearf'){ resetFilters('all'); return; }
  if(a==='more'||a==='moveon'||a==='unskip'){ const h=b.closest('.j4h'), vk=h?h.dataset.vk:(stopOf(k)||{}).vk; if(!vk) return;
    if(a==='more') J.trav.extra[vk]=(J.trav.extra[vk]||0)+3; else if(a==='moveon') J.trav.skip[vk]=1; else delete J.trav.skip[vk];
    save(); renderList(); if(a==='moveon'){ const r=root.querySelector('.j4row.next'); if(r) r.scrollIntoView({block:'center',behavior:'smooth'}); } return; }
  if(a==='pick'){ const t=b.dataset.tgt; PK=PK&&PK.tgt===t?null:{tgt:t,q:''}; renderSet(); const q=root.querySelector('.j4pkq'); if(q) q.focus(); return; }
  if(a==='set'){ const f=b.dataset.f, v=b.dataset.v; if(f==='trav.depth'){ J.trav.depth=v==='all'?'all':+v; } else if(f==='trav.mode'){ J.trav.mode=v; if(v==='home'&&!J.trav.home) PK={tgt:'home',q:''}; else PK=null; } save(); render(); const q=root.querySelector('.j4pkq'); if(q) q.focus(); return; }
  if(a==='ex'){ loadExample(b.dataset.ex); render(); return; }
  if(a==='undo'){ if(UNDO){ J.life=JSON.parse(UNDO); J.life.legs.forEach(l=>l.pl=fixPl(l.pl)); UNDO=null; save(); render(); } return; }
  if(a==='legadd'){ const L=J.life.legs, last=L[L.length-1], from=last?(last.brief?last.from:last.to):1960; L.push({pl:null,from,to:Math.min(T1,from+5),brief:false,label:''}); PK={tgt:'leg:'+(L.length-1),q:''}; save(); render(); const q=root.querySelector('.j4pkq'); if(q) q.focus(); return; }
  if(a==='legclear'){ UNDO=JSON.stringify(J.life); J.life.legs=[]; PK=null; save(); render(); return; }
  if(a==='legup'||a==='legdn'||a==='legrm'){ const i=+b.closest('.j4leg').dataset.leg, L=J.life.legs; if(a==='legrm'){ UNDO=JSON.stringify(J.life); L.splice(i,1); } else swap(L,i,a==='legup'?i-1:i+1); PK=null; save(); render(); return; }
  if(a==='regup'||a==='regdn'){ const r=b.closest('.j4reg').dataset.reg, O=J.trav.order, i=O.indexOf(r); swap(O,i,a==='regup'?i-1:i+1); J.trav.extra={}; J.trav.skip={}; save(); render(); return; }
  if(a==='travreset'){ const h=J.trav.home, ro=J.trav.ro; J.trav={...fresh().trav,home:h,ro}; PK=null; save(); render(); return; }
  if(a==='discreset'){ J.disc.w={S:7,A:5,F:3,I:5}; save(); render(); return; }
});
const yr=v=>{ const n=Math.round(+v); return v===''||!isFinite(n)?null:Math.max(T0,Math.min(T1,n)); };
root.addEventListener('change',e=>{ const t=e.target; state();
  if(t.classList.contains('j4done')){ setDone(t.closest('.j4row').dataset.k,t.checked); return; }
  const f=t.dataset.f; if(!f) return; const leg=t.closest('.j4leg'), g=leg?J.life.legs[+leg.dataset.leg]:null; let full=false;
  if(f==='hide') J.hide=t.checked;
  else if(f==='life.title') J.life.title=t.value.trim().slice(0,40);
  else if(f==='life.birth') J.life.birth=yr(t.value);
  else if(f==='life.cut') J.life.cut=t.value;
  else if(f==='life.carry') J.life.carry=t.checked;
  else if(g&&f==='leg.from'){ const y=yr(t.value); if(y!=null){ g.from=y; if(!g.brief&&g.to<y){ g.to=y; full=true; } } }
  else if(g&&f==='leg.to'){ const y=yr(t.value); if(y!=null){ g.to=y; if(g.from>y){ g.from=y; full=true; } } }
  else if(g&&f==='leg.brief'){ g.brief=t.checked; if(g.brief){ g.to=g.from; if(!g.label) g.label='brief trip'; } else if(g.label==='brief trip') g.label=''; full=true; }
  else if(g&&f==='leg.label') g.label=t.value.trim().slice(0,40);
  else if(f==='trav.laps'){ J.trav.laps=t.checked; J.trav.extra={}; J.trav.skip={}; }
  else if(f==='trav.mix') J.trav.mix=t.checked;
  else if(f==='trav.on'){ const r=t.closest('.j4reg').dataset.reg; J.trav.off=J.trav.off.filter(x=>x!==r); if(!t.checked) J.trav.off.push(r); full=true; }
  else if(f==='trav.narrow'){ const r=t.closest('.j4reg').dataset.reg; if(t.value) J.trav.narrow[r]=t.value; else delete J.trav.narrow[r]; full=true; }
  else if(f==='disc.knownLast') J.disc.o.knownLast=t.checked;
  else if(f==='disc.roots') J.disc.o.roots=t.checked;
  else return;
  save(); if(full) render(); else renderList(); });
root.addEventListener('input',e=>{ const t=e.target;
  if(t.classList.contains('j4pkq')&&PK){ PK.q=t.value; const r=t.parentNode.querySelector('.j4pkres'); if(r) r.innerHTML=pickerResults(PK.q); return; }
  if(t.type!=='range') return; state();
  if(t.dataset.f==='hist.n') J.hist.n=+t.value; else if(t.dataset.f==='disc.w') J.disc.w[t.dataset.w]=+t.value; else return;
  t.nextElementSibling.textContent=t.value; save(); renderList(); });
root.addEventListener('toggle',e=>{ const c=e.target.classList; if(!c||!J) return; if(c.contains('j4box')){ J.open=e.target.open; save(); } else if(c.contains('j4route')){ J.trav.ro=e.target.open; save(); } },true);
root.addEventListener('keydown',e=>{ if(e.key==='Escape'&&PK){ PK=null; renderSet(); } });

/* ---------- wiring: the old journey code is made inert ---------- */
renderJourney=function(){};
buildJourneyControls=function(){};
VIEWHOOK.journey=render;
FHOOKS.push(()=>{ if(curView()==='journey') render(); });
try{ if(P()) P().onChange(()=>{ if(curView()==='journey') render(); }); }catch(e){}
window.JOURNEY={ render, build:k=>build(k), state:()=>state(), loadExample:k=>{ loadExample(k); render(); }, setKind:k=>{ state(); J.kind=k; save(); render(); }, prompt:k=>{ const s=stopOf(k); return s?(s.t==='g'?movPrompt(s.id):placePrompt(s).txt):null; } };
render();
