/* Filter bar: place at any depth, time (stay, until, custom range), genre (band / tradition / movement), made or heard, resets. */
const bar=document.createElement('div'); bar.className='fbar'; bar.id='fbar';
const ic=UI.ic;
bar.innerHTML=`<div class="fpills" role="group" aria-label="Filters" data-keepsheet>
  <span class="fgrp"><button type="button" class="fchip fbtn" data-fp="place" aria-expanded="false"></button><button type="button" class="fchipx fx" data-fr="place" aria-label="Reset place">${ic('x')}</button></span>
  <span class="fgrp"><button type="button" class="fchip fbtn" data-fp="time" aria-expanded="false"></button><button type="button" class="fchipx fx" data-fr="time" aria-label="Reset time">${ic('x')}</button></span>
  <span class="fgrp"><button type="button" class="fchip fbtn" data-fp="genre" aria-expanded="false"></button><button type="button" class="fchipx fx" data-fr="genre" aria-label="Reset genre">${ic('x')}</button></span>
  <button type="button" class="fchip freset" id="fresetall" title="Now, everywhere, everything">Reset</button></div>
  <div id="ftimehost" hidden></div>`;
const fsb=document.getElementById('fsheetb'); fsb.innerHTML='<div class="fpanel" id="fpanel"></div>';
const anchor=document.querySelector('.stbar'); anchor.parentNode.insertBefore(bar,anchor);
// the old time bar lives inside the time filter now: its transport (back, slider, forward, speed) moves into the panel when it opens
const stctl=document.getElementById('stctl'), thost=bar.querySelector('#ftimehost'), moment=document.getElementById('stmoment');
if(moment){ moment.className='fmoment'; moment.innerHTML=ic('note'); moment.title='Playlist for this moment'; moment.setAttribute('aria-label','Playlist for this moment'); moment.setAttribute('data-keepsheet',''); bar.appendChild(moment); }
['stwhere','stexit'].forEach(id=>{ const e=document.getElementById(id); if(e) e.hidden=true; });
if(stctl){ stctl.querySelectorAll('.sp').forEach(e=>e.remove()); thost.appendChild(stctl); const ob=document.querySelector('.stbar'); if(ob) ob.hidden=true; }
const panel=document.getElementById('fpanel'); let open=null, drill={place:null,genre:null}, q={place:'',genre:''};
const $b=k=>bar.querySelector(`[data-fp="${k}"]`);
const norm=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();

function timeLabel(){ if(STFROM===T0) return STY>=T1?'All of history':'Everything up to '+fmtY(STY); if(STFROM!=null) return fmtY(STFROM)+' to '+fmtY(STY); return STSPAN?`${fmtY(STY)} ± ${STSPAN} yrs`:fmtY(STY); }
function paint(){
  const on=[!!STP,!(timeIsDefault()&&FTM!=='made'),!!FG];
  $b('place').innerHTML=`${ic('pin')}<span>${STP?esc(placeName())+(FPL==='made'?' <small>made here</small>':''):'Everywhere'}</span>`;
  $b('time').innerHTML=`${ic('clock')}<span>${esc(timeLabel())}${FTM==='made'?' <small>born then</small>':''}</span>`;
  $b('genre').innerHTML=`${ic('note')}<span>${FG?esc(fgName()):'Everything'}</span>`;
  ['place','time','genre'].forEach((k,n)=>$b(k).parentNode.classList.toggle('on',on[n]));
  // a chip the open playlist does not use is greyed: Essential songs are the genre's own list, whatever the place and years
  { const ess=typeof essentialOf==='function'&&essentialOf()&&stPanelOpen&&GP==null; $b('place').parentNode.classList.toggle('ign',!!ess&&on[0]); $b('time').parentNode.classList.toggle('ign',!!ess&&on[1]); }
  bar.querySelector('[data-fr="place"]').hidden=!STP; bar.querySelector('[data-fr="time"]').hidden=timeIsDefault()&&FTM!=='made'; bar.querySelector('[data-fr="genre"]').hidden=!FG;
  document.getElementById('fresetall').hidden=!fActive();
  let n=0; if(STV) STV.forEach(v=>{ if(!v.anc) n++; });
  document.getElementById('fcount').textContent=fActive()?`${n} of ${N.length} movements`:'';
  ['place','time','genre'].forEach(k=>$b(k).setAttribute('aria-expanded',String(open===k)));
  const v=curView(); bar.hidden=(v==='journey'||v==='me'); if(moment) moment.hidden=!['tree','map','tunnel'].includes(v);
}
const seg=(name,cur,opts)=>`<span class="seg" role="group">${opts.map(([v,l,t])=>`<button type="button" data-${name}="${v}" aria-pressed="${cur===v}" title="${t||''}">${l}</button>`).join('')}</span>`;

/* place */
const REGS=REG.map(r=>r[0]);
const ctyOf=reg=>Object.keys(ISO).filter(i=>ISO[i][1]===reg).sort((a,b)=>isoName(a).localeCompare(isoName(b)));
const citiesOf=iso=>CITIES.map((c,i)=>({c,i})).filter(o=>o.c.iso2===iso).sort((a,b)=>(b.c.size-a.c.size)||a.c.name.localeCompare(b.c.name));
const cnm=c=>c.name+(c.kind==='area'?' (area)':'');
function placeHtml(){ const s=norm(q.place.trim()); let body='', crumbs='';
  if(s){ const out=[];
    REGS.forEach(r=>{ if(norm(regName[r]).includes(s)) out.push(`<button type="button" data-pl="reg:${r}"><b>${esc(regName[r])}</b> <small>continent</small></button>`); });
    Object.keys(ISO).forEach(i=>{ if(norm(isoName(i)).includes(s)) out.push(`<button type="button" data-pl="cty:${i}"><b>${esc(isoName(i))}</b> <small>country</small></button>`); });
    CITIES.forEach((c,i)=>{ if(out.length<60&&(norm(c.name).includes(s)||(c.names||[]).some(n=>norm(n[1]).includes(s)))) out.push(`<button type="button" data-pl="city:${i}"><b>${esc(cnm(c))}</b> <small>${esc(isoName(c.iso2))}</small></button>`); });
    body=out.length?out.slice(0,60).join(''):'<p class="fine">No place by that name.</p>';
  } else if(!drill.place){ body=REGS.map(r=>`<span class="frow"><button type="button" data-pl="reg:${r}"><i class="fdot" style="background:${regColor(r)}"></i><b>${esc(regName[r])}</b></button><button type="button" class="fmore" data-dr="reg:${r}" aria-label="Countries in ${esc(regName[r])}">countries ›</button></span>`).join('');
  } else if(drill.place.k==='reg'){ const r=drill.place.reg; crumbs=`<button type="button" data-dr="">All continents</button> › <b>${esc(regName[r])}</b>`;
    body=`<button type="button" data-pl="reg:${r}"><b>All of ${esc(regName[r])}</b></button>`+ctyOf(r).map(i=>{ const n=citiesOf(i).length; return `<span class="frow"><button type="button" data-pl="cty:${i}">${esc(isoName(i))}</button>${n?`<button type="button" class="fmore" data-dr="cty:${i}">${n} places ›</button>`:''}</span>`; }).join('');
  } else { const i=drill.place.iso, r=isoReg(i); crumbs=`<button type="button" data-dr="">All continents</button> › <button type="button" data-dr="reg:${r}">${esc(regName[r])}</button> › <b>${esc(isoName(i))}</b>`;
    body=`<button type="button" data-pl="cty:${i}"><b>All of ${esc(isoName(i))}</b></button>`+citiesOf(i).map(o=>`<button type="button" data-pl="city:${o.i}">${esc(cnm(o.c))}</button>`).join(''); }
  return `<div class="fhead"><div class="fqw"><input type="search" id="fq" placeholder="Search continents, countries, cities and areas" value="${esc(q.place)}" aria-label="Search places"></div>${seg('fpl',FPL,[['heard','Heard here','Everything that was known in this place'],['made','Made here','Only what originated in this place']])}</div>${modeRow('place')}
  ${crumbs?`<p class="fcrumb">${crumbs}</p>`:''}<div class="flist">${body}</div>`; }
/* one or several: in "Several" mode a tap adds or removes, and the sheet stays open */
let multi={place:false,genre:false};
const pk=p=>p.k==='reg'?'reg:'+p.reg:p.k==='cty'?'cty:'+p.iso:'city:'+p.i, gk=g=>g.k+':'+g.id;
const items=X=>!X?[]:X.k==='multi'?X.items:[X], pack=L=>L.length===0?null:L.length===1?L[0]:{k:'multi',items:L};
const pFrom=v=>{ const [k,x]=v.split(':'); return k==='reg'?{k:'reg',reg:x}:k==='cty'?{k:'cty',iso:x}:{k:'city',i:+x,iso:CITIES[+x].iso2}; };
function toggle(L,key,kf,item){ L=L.slice(); const i=L.findIndex(x=>kf(x)===key); if(i>=0) L.splice(i,1); else L.push(item); return L; }
function pickPlace(v){ const p=pFrom(v); if(!multi.place){ setPlace(p); close(); return; } setPlace(pack(toggle(items(STP),v,pk,p))); render(); }
function pickGenre(v){ const [k,id]=v.split(':'), g={k,id}; if(!multi.genre){ FG=g; stApply(); applyHighlight(); close(); return; } FG=pack(toggle(items(FG),v,gk,g)); stApply(); applyHighlight(); render(); }
/* which songs one genre brings to the playlist: the ones that define it, or the ones most heard */
function songRow(){ const one=FG&&FG.k==='mov', b=(v,i,l,t)=>`<button type="button" data-fsong="${v}" aria-pressed="${FSONG===v}" title="${t}">${ic(i)}${l}</button>`;
  return `<div class="fsongs${one?'':' off'}"><span class="seg" role="group" aria-label="Which songs">${b('essential','star','Essential','The songs that define the sound, hand-picked')}${b('popular','trend','Popular','What was most heard in the chosen place and time')}</span><small>${one?(FSONG==='essential'?'The songs that define the sound':'What was most heard there and then'):'Applies when one movement is chosen'}</small></div>`; }
function modeRow(which){ const L=which==='place'?items(STP):items(FG), kf=which==='place'?pk:gk, nm=which==='place'?(x=>placeName(x).split(', ')[0]):(x=>fgName(x)), attr=which==='place'?'data-pl':'data-fg';
  return `<div class="fmode">${seg('fmm',multi[which]?'m':'s',[['s','One'],['m','Several']])}${multi[which]?`<button type="button" class="lbtn primary" data-done>Done</button>`:''}</div>`+
    (multi[which]&&L.length?`<div class="fsel">${L.map(x=>`<button type="button" class="fselb" ${attr}="${kf(x)}">${esc(nm(x))} ${ic('x')}</button>`).join('')}</div>`:''); }


/* genre */
const tradBand=t=>{ const m=TRADM[t]; return m&&m.length?byId[m[0]].band:null; };
const tradsOf=b=>Object.keys(TRADM).filter(t=>tradBand(t)===b).sort((a,c)=>String(TRADN[a]).localeCompare(String(TRADN[c])));
function genreHtml(){ const s=norm(q.genre.trim()); let body='', crumbs='';
  if(s){ const out=[];
    BANDS.forEach(([b,n])=>{ if(norm(n).includes(s)) out.push(`<button type="button" data-fg="band:${b}"><b>${esc(n)}</b> <small>family</small></button>`); });
    Object.keys(TRADM).forEach(t=>{ if(TRADM[t].length>1&&norm(TRADN[t]||t).includes(s)) out.push(`<button type="button" data-fg="trad:${t}"><b>${esc(TRADN[t]||t)}</b> <small>tradition · ${TRADM[t].length}</small></button>`); });
    N.forEach(n=>{ if(out.length<70&&norm(n.name).includes(s)) out.push(`<button type="button" data-fg="mov:${n.id}"><b>${esc(n.name)}</b> <small>movement and its descendants</small></button>`); });
    body=out.length?out.slice(0,70).join(''):'<p class="fine">No genre by that name.</p>';
  } else if(!drill.genre){ body=BANDS.map(([b,n])=>`<span class="frow"><button type="button" data-fg="band:${b}"><b>${esc(n)}</b></button><button type="button" class="fmore" data-dg="band:${b}">${tradsOf(b).length} traditions ›</button></span>`).join('');
  } else if(drill.genre.k==='band'){ const b=drill.genre.id; crumbs=`<button type="button" data-dg="">All families</button> › <b>${esc(bandName[b])}</b>`;
    body=`<button type="button" data-fg="band:${b}"><b>All of ${esc(bandName[b])}</b></button>`+tradsOf(b).map(t=>TRADM[t].length>1?`<span class="frow"><button type="button" data-fg="trad:${t}">${esc(TRADN[t]||t)}</button><button type="button" class="fmore" data-dg="trad:${t}">${TRADM[t].length} movements ›</button></span>`:`<button type="button" data-fg="mov:${TRADM[t][0]}">${esc(byId[TRADM[t][0]].name)}</button>`).join('');
  } else { const t=drill.genre.id, b=tradBand(t); crumbs=`<button type="button" data-dg="">All families</button> › <button type="button" data-dg="band:${b}">${esc(bandName[b])}</button> › <b>${esc(TRADN[t]||t)}</b>`;
    body=`<button type="button" data-fg="trad:${t}"><b>All of ${esc(TRADN[t]||t)}</b></button>`+TRADM[t].slice().sort((a,c)=>byId[a].year-byId[c].year).map(id=>`<button type="button" data-fg="mov:${id}">${esc(byId[id].name)} <small>${fmtY(byId[id].year)}</small></button>`).join(''); }
  return `<div class="fhead"><div class="fqw"><input type="search" id="fq" placeholder="Search families, traditions and movements" value="${esc(q.genre)}" aria-label="Search genres"></div></div>${modeRow('genre')}${songRow()}
  ${crumbs?`<p class="fcrumb">${crumbs}</p>`:''}<div class="flist">${body}</div><p class="fine">A movement filter keeps the movement and everything descended from it.</p>`; }

/* time */
const ERAS=[['All of history',T0,T1],['Before recording (up to 1876)',T0,1876],['The recording era (1877 to now)',1877,T1],['The streaming era (2008 to now)',2008,T1]];
function timeHtml(){ const mode=STFROM===T0?'until':STFROM!=null?'range':String(STSPAN);
  const P=[['until','Everything up to that year'],['0','Just that year'],['2','A few years'],['5','A decade'],['12','A lifetime'],['range','From a year of my choosing']];
  return `<div class="tyear"><input id="fyear" type="number" step="1" min="${T0}" max="${T1}" value="${STY}" aria-label="Year"><div id="ftslot"></div></div>
  <div class="ftime"><label>Stay <select id="fstay">${P.map(([v,l])=>`<option value="${v}"${v===mode?' selected':''}>${l}</option>`).join('')}</select></label>
  <label id="ffromw"${mode==='range'?'':' hidden'}>From <input id="ffrom" type="number" step="1" value="${STFROM!=null&&STFROM!==T0?STFROM:Math.max(T0,STY-10)}" aria-label="From year"></label></div>
  <div class="ftime">${seg('ftm',FTM,[['heard','Alive then','Everything that could be heard in that time'],['made','Born then','Only what began in that time']])}
  <select id="fera" aria-label="Jump to an era"><option value="">Jump to an era…</option>${ERAS.map(([l],n)=>`<option value="${n}">${l}</option>`).join('')}</select></div>`; }
function applyTime(){ const sel=panel.querySelector('#fstay').value, y=Math.max(T0,Math.min(T1,Math.round(+panel.querySelector('#fyear').value||STY)));
  stopPlay(); setYear(y);
  if(sel==='until') setStay('until'); else if(sel==='range'){ const f=Math.round(+panel.querySelector('#ffrom').value); setStay('from',isFinite(f)?Math.min(f,y):y-10); } else setStay(+sel);
  stApply(); syncTime(); }

let shown=false;
function render(){ if(stctl&&stctl.parentNode!==thost) thost.appendChild(stctl);
  if(!open){ if(shown){ shown=false; UI.sheet.close('filter'); } paint(); return; }
  if(open==='place'&&STP&&STP.k==='multi') multi.place=true; if(open==='genre'&&FG&&FG.k==='multi') multi.genre=true;
  panel.innerHTML=open==='place'?placeHtml():open==='genre'?genreHtml():timeHtml(); paint();
  { const ps=new Set(items(STP).map(pk)), gs=new Set(items(FG).map(gk)); panel.querySelectorAll('.flist [data-pl]').forEach(b=>{ const on=ps.has(b.dataset.pl); b.classList.toggle('on',on); if(b.parentNode.classList.contains('frow')) b.parentNode.classList.toggle('on',on); }); panel.querySelectorAll('.flist [data-fg]').forEach(b=>{ const on=gs.has(b.dataset.fg); b.classList.toggle('on',on); if(b.parentNode.classList.contains('frow')) b.parentNode.classList.toggle('on',on); }); }
  document.getElementById('fsheett').textContent=open==='place'?'Place':open==='genre'?'Genre':'Time';
  if(!shown||UI.sheet.current()!=='filter'){ shown=true; UI.sheet.open('filter',{clear:true,peek:open==='time',onClose:()=>{ shown=false; if(open){ open=null; if(stctl) thost.appendChild(stctl); paint(); } }}); }
  else document.getElementById('sheet-filter').classList.toggle('peek',open==='time');
  if(open==='time'&&stctl){ const slot=panel.querySelector('#ftslot'); if(slot) slot.appendChild(stctl); }
  const fq=panel.querySelector('#fq'); if(fq){ fq.oninput=()=>{ q[open]=fq.value; const pos=fq.selectionStart; render(); const n=panel.querySelector('#fq'); n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} }; }
  const st=panel.querySelector('#fstay'); if(st){ st.onchange=()=>{ panel.querySelector('#ffromw').hidden=st.value!=='range'; applyTime(); };
    panel.querySelectorAll('#fyear,#ffrom').forEach(i=>{ i.onchange=applyTime; i.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); i.blur(); } }; });
    const er=panel.querySelector('#fera'); er.onchange=()=>{ const E=ERAS[+er.value]; if(!E) return; stopPlay(); setYear(E[2]); if(E[1]===T0) setStay('until'); else setStay('from',E[1]); stApply(); render(); }; }
}
function close(){ open=null; render(); }
panel.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; const d=b.dataset;
  if(d.pl){ pickPlace(d.pl); }
  else if('dr' in d){ const v=d.dr; drill.place=!v?null:v.startsWith('reg:')?{k:'reg',reg:v.slice(4)}:{k:'cty',iso:v.slice(4)}; render(); }
  else if(d.fpl){ FPL=d.fpl; stApply(); render(); }
  else if(d.fsong){ FSONG=d.fsong; try{ localStorage.setItem('wmft-fsong',FSONG); }catch(_){} stApply(); stPanelUpdate(); render(); }
  else if(d.fg){ pickGenre(d.fg); }
  else if(d.fmm){ multi[open]=d.fmm==='m'; render(); }
  else if('done' in d){ close(); }
  else if('dg' in d){ const v=d.dg; drill.genre=!v?null:{k:v.split(':')[0],id:v.split(':')[1]}; render(); }
  else if(d.ftm){ FTM=d.ftm; stApply(); render(); }
  else if(d.tq){ const [a,b2]=d.tq.split(':').map(Number); stopPlay(); setYear(b2); if(a===T0) setStay('until'); else setStay('from',a); stApply(); render(); } });
bar.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return;
  if(b.dataset.fp){ open=open===b.dataset.fp?null:b.dataset.fp; q.place=q.genre=''; render(); if(open&&open!=='time'&&matchMedia('(pointer:fine)').matches){ const f=panel.querySelector('#fq'); if(f) setTimeout(()=>f.focus(),320); } }
  else if(b.dataset.fr){ resetFilters(b.dataset.fr); render(); }
  else if(b.id==='fresetall'){ resetFilters('all'); close(); } });
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&open) close(); });
const syncTime=()=>{ paint(); if(open!=='time') return; const y=panel.querySelector('#fyear'), s=panel.querySelector('#fstay'), f=panel.querySelector('#ffrom'), a=document.activeElement;
  if(y&&a!==y) y.value=STY; const mode=STFROM===T0?'until':STFROM!=null?'range':String(STSPAN); if(s&&a!==s&&[...s.options].some(o=>o.value===mode)) s.value=mode;
  if(f&&a!==f&&STFROM!=null&&STFROM!==T0) f.value=STFROM; const yl=panel.querySelector('#fylab'); if(yl) yl.textContent=mode==='range'?'To year':mode==='until'?'Up to year':'Year'; const w=panel.querySelector('#ffromw'); if(w&&a!==s) w.hidden=mode!=='range';
  panel.querySelectorAll('[data-ftm]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ftm===FTM))); };
FHOOKS.push(syncTime);
// while time is playing the year moves without a filter event: follow it
let lastT=''; const stBarUI0=stBarUI; stBarUI=function(){ stBarUI0.apply(this,arguments); const k=STY+'|'+STFROM+'|'+STSPAN; if(k!==lastT){ lastT=k; try{ syncTime(); }catch(e){} } };
const showView0=showView; showView=function(v){ const r=showView0.apply(this,arguments); try{ paint(); }catch(e){} return r; };
const oldExit=document.getElementById('stexit'); if(oldExit) oldExit.hidden=true;
window.FILTERS={ open:k=>{ open=k; render(); }, close, paint };
paint();
