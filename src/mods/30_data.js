/* Data tab: a lookup over everything the site holds. Tables: songs (chart rows, decade lists, genre examples), movements, traditions, places, artists.
   Obeys the site filters (place, time, genre) unless told not to; its own options live only here. */
const root=document.getElementById('view-data');
const nrm=s=>String(s==null?'':s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const PAGE=200, CONF={h:'high',m:'medium',l:'low'};
const KIND={chart:'Chart',era:'Decade list',genre:'Genre example'};
const cmpS=(a,b)=>String(a).localeCompare(String(b),undefined,{sensitivity:'base',numeric:true});
const host=u=>{ try{ return new URL(u).hostname.replace(/^www\./,''); }catch(e){ return ''; } };
const okUrl=u=>/^https?:\/\//i.test(u||'');
const decOf=y=>Math.floor(y/10)*10;

const S={ tab:'songs', ignore:false, lim:PAGE,
  songs:{q:'',exact:false,kind:'',origin:'',scene:'',src:'',status:'',sort:'year',dir:1},
  movements:{q:'',sort:'year',dir:1}, traditions:{q:'',sort:'name',dir:1},
  places:{q:'',level:'country',sort:'name',dir:1}, artists:{q:'',sort:'n',dir:-1} };

/* ---------- the songs index ---------- */
let IDX=null, IDXSIG='';
function sig(){ let n=0, m=0; for(const i in YEARL) for(const y in YEARL[i]){ n++; m+=(YEARL[i][y].songs||[]).length; if(YEARL[i][y].status) m+=YEARL[i][y].status.length*100003; }
  let e=0; try{ for(const k in ERAX){ e+=1+(ERAX[k].songs||[]).length; if(ERAX[k].status==='verified') e+=7919; } }catch(_){}
  return n+':'+m+':'+e; }
function buildIndex(){ const R=[];
  const RC=DATA.relcheck||{};
  const push=r=>{ r.na=nrm(r.artist); r.nq=r.na+' \u0001 '+nrm(r.title); const c=RC[r.artist+'\u0001'+r.title]; r.ychk=!c?'':c[0]==='checked'?'Checked':'Earlier release on record: '+c[1]; R.push(r); };
  for(const iso in YEARL) for(const y in YEARL[iso]){ const L=YEARL[iso][y]; (L.songs||[]).forEach(s=>{
    let sn='', su=''; if(typeof s[5]==='number'){ const x=(DATA.ysrc||[])[s[5]]; if(x){ sn=x[0]; su=x[1]||''; } } else { sn=s[5]||''; su=s[6]||''; }
    if(!okUrl(su)) su='';
    push({kind:'chart',artist:s[0],title:s[1],iso,year:+y,ylabel:String(y),rel:+s[2]||null,origin:s[3]||'',rank:+s[4]||null,cpos:s[8]!=null?+s[8]:null,scene:s[7]||'',
      src:sn||'Chart list (source not recorded)',url:su,grp:su?host(su):(sn||'Source not recorded'),status:L.status||'built in',note:''}); }); }
  const era=(iso,dec,songs,status)=>songs.forEach(s=>{ const six=s.length>=6;
    push({kind:'era',artist:s[0],title:s[1],iso,year:+dec,ylabel:dec+'s',rel:+s[2]||null,origin:s[3]||'',rank:null,scene:six?(s[4]||''):'',
      src:status==='researched'?'Researched decade list':'Decade list drafted on request',url:'',grp:status==='researched'?'Researched decade list':'Decade list drafted on request',
      status,note:CONF[six?s[5]:s[4]]?'confidence '+CONF[six?s[5]:s[4]]:''}); });
  for(const iso in ERA) for(const dec in ERA[iso]){ const b=ERA[iso][dec]; if(b&&b.songs) era(iso,dec,b.songs,'researched'); }
  try{ for(const k in ERAX){ const m=/^([A-Z]{2})_(\d{4})$/.exec(k), x=ERAX[k]; if(!m||!x||!Array.isArray(x.songs)) continue;
    const b=ERA[m[1]]&&ERA[m[1]][m[2]]; if(b&&b.songs&&b.songs.length) continue; era(m[1],m[2],x.songs,x.status||'draft'); } }catch(_){}
  N.forEach(n=>{ const pl=PL[n.id]; if(!pl) return; const Y=pl.yrs||[], iso=(CNT[n.id]||[])[0]||'', tr=TRAD_OF[n.id];
    [...(pl.intro||[]).map(x=>[x,'intro']),...(pl.peak||[]).map(x=>[x,'peak'])].forEach(([x,part],i)=>{ const y=Y[i];
      push({kind:'genre',artist:x[0],title:x[1],iso,year:y&&y[0]!=null?y[0]:null,ylabel:y&&y[0]!=null?String(y[0]):'',rel:y&&y[0]!=null?y[0]:null,origin:'',rank:null,scene:'',
        mid:n.id,mov:n.name,trad:tr?(TRADN[tr]||tr):'',band:bandName[n.band]||n.band,place:n.place||'',
        src:'Curated genre playlist',url:'',grp:'Curated genre playlist',status:pl.status||'',note:part+(y&&y[1]!=null?', written '+fmtY(y[1]):'')}); }); });
  IDX=R; IDXSIG=sig(); return R; }
function index(){ if(!IDX||IDXSIG!==sig()) buildIndex(); return IDX; }

/* ---------- site filters ---------- */
function siteOn(){ return !S.ignore&&fActive(); }
function placeOK(iso,P=STP){ if(!P) return true; if(P.k==='multi') return P.items.some(q=>placeOK(iso,q)); if(P.k==='reg') return isoReg(iso)===P.reg; return iso===placeIso(P); }
function songPass(){ if(!siteOn()) return ()=>true; const [y0,y1]=stRange();
  return r=>{ if(r.kind==='genre') return inF(r.mid); if(FG) return false; if(!placeOK(r.iso)) return false;
    return r.kind==='chart'?(r.year>=y0&&r.year<=y1):(r.year<=y1&&r.year+9>=y0); }; }
function siteNote(){ if(S.ignore) return fActive()?'Site filters ignored on this page.':'';
  if(!fActive()) return ''; const [y0,y1]=stRange(), bits=[];
  if(STP) bits.push(placeName()); if(!timeIsDefault()) bits.push(y0===y1?fmtY(y0):fmtY(y0)+' to '+fmtY(y1)); if(FG) bits.push(fgName());
  return 'Following the site filters'+(bits.length?': '+bits.join(' · '):'')+'.'; }

/* ---------- table definitions: cols = {k,label,v(row) value,h(row) html?,num?,csv?} ---------- */
const lk=(attr,val,txt,title)=>`<button type="button" class="dlk" data-${attr}="${esc(val)}"${title?` title="${esc(title)}"`:''}>${esc(txt)}</button>`;
const ctyCell=iso=>iso?lk('cty',iso,isoName(iso),'Set the site place filter to '+isoName(iso)):'';
const T={};
T.songs={ label:'Songs', unit:'songs',
  cols:[ {k:'kind',label:'Kind',v:r=>KIND[r.kind],h:r=>`<span class="dkind k-${r.kind}">${KIND[r.kind]}</span>`},
    {k:'artist',label:'Artist',v:r=>r.artist,h:r=>lk('artist',r.artist,r.artist,'Show only this artist'),w:1},
    {k:'title',label:'Title',v:r=>r.title,w:1},
    {k:'country',label:'Country',v:r=>r.iso?isoName(r.iso):'',h:r=>ctyCell(r.iso)},
    {k:'year',label:'Year',v:r=>r.year,h:r=>esc(r.ylabel),num:1,csvv:r=>r.ylabel,tip:'Chart year, decade of the list, or the song’s year for genre examples'},
    {k:'rel',label:'Released',v:r=>r.rel,num:1},
    {k:'ychk',label:'Release year check',v:r=>r.ychk,tip:'Checked: MusicBrainz has an official release within a year of this one. Earlier release on record: it has one more than a year earlier, so the year here may be a chart or reissue year. Empty: not checked'},
    {k:'origin',label:'Origin',v:r=>r.origin,tip:'Home-grown or foreign in the country of the list'},
    {k:'rank',label:'List order',v:r=>r.rank,num:1,tip:'Where the song sits in this site’s list for that year'},
    {k:'cpos',label:'Chart position',v:r=>r.cpos,num:1,tip:'Position on the cited chart, where it has been recorded'},
    {k:'scene',label:'Scene',v:r=>r.scene},
    {k:'mov',label:'Movement',v:r=>r.mov||'',h:r=>r.mid?lk('mov',r.mid,r.mov,'Open this movement in the list'):''},
    {k:'trad',label:'Tradition',v:r=>r.trad||'',w:1},
    {k:'band',label:'Family',v:r=>r.band||'',w:1},
    {k:'place',label:'Place',v:r=>r.place||''},
    {k:'note',label:'Detail',v:r=>r.note},
    {k:'src',label:'Source',w:1,v:r=>r.src,h:r=>r.url?`<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.src)}</a>`:esc(r.src)},
    {k:'url',label:'Source link',v:r=>r.url,csvonly:1},
    {k:'status',label:'List status',v:r=>r.status} ],
  rows(){ const o=S.songs, pass=songPass(), q=nrm(o.q.trim());
    return index().filter(r=>pass(r)&&(!o.kind||r.kind===o.kind)&&(!o.origin||r.origin===o.origin)&&(!o.scene||r.scene===o.scene)&&(!o.src||r.grp===o.src)&&(!o.status||r.status===o.status)&&(!q||(o.exact?r.na===q:r.nq.includes(q)))); },
  tie:(a,b)=>cmpS(a.iso,b.iso)||((a.year==null?1e9:a.year)-(b.year==null?1e9:b.year))||((a.rank||1e9)-(b.rank||1e9)) };
const peakTxt=id=>{ const s=STD[id]; return s?(s[0]===s[1]?fmtY(s[0]):fmtY(s[0])+' to '+fmtY(s[1])):''; };
const plN=id=>{ const p=PL[id]; return p?(p.intro||[]).length+(p.peak||[]).length:0; };
T.movements={ label:'Movements', unit:'movements',
  cols:[ {k:'name',label:'Movement',w:1,v:n=>n.name,h:n=>lk('mov',n.id,n.name,'Open this movement in the list')},
    {k:'band',label:'Family',v:n=>bandName[n.band]||n.band,w:1},
    {k:'trad',label:'Tradition',v:n=>TRADN[TRAD_OF[n.id]]||TRAD_OF[n.id]||'',w:1},
    {k:'place',label:'Origin place',v:n=>n.place||''},
    {k:'country',label:'Country',v:n=>isoName((CNT[n.id]||[])[0]||''),h:n=>ctyCell((CNT[n.id]||[])[0])},
    {k:'year',label:'Start',v:n=>n.year,h:n=>esc(fmtY(n.year)),num:1},
    {k:'peak',label:'Peak years',v:n=>(STD[n.id]||[])[0],h:n=>esc(peakTxt(n.id)),num:1,csvv:n=>peakTxt(n.id)},
    {k:'sig',label:'Signif.',v:n=>(SC[n.id]||[])[0],num:1,tip:'Significance, 1 to 5'},
    {k:'ease',label:'Ease',v:n=>(SC[n.id]||[])[1],num:1,tip:'Ease of listening, 1 to 5'},
    {k:'known',label:'Known',v:n=>(SC[n.id]||[])[2],num:1,tip:'How widely known, 1 to 5'},
    {k:'intr',label:'Intrigue',v:n=>(SC[n.id]||[])[3],num:1,tip:'Intrigue, 1 to 5'},
    {k:'pl',label:'Playlist',v:n=>(PL[n.id]||{}).status||''},
    {k:'n',label:'Songs',v:n=>plN(n.id),num:1} ],
  rows(){ const q=nrm(S.movements.q.trim()), on=siteOn();
    return N.filter(n=>(!on||inF(n.id))&&(!q||nrm(n.name+' '+(n.place||'')+' '+(TRADN[TRAD_OF[n.id]]||'')).includes(q))); },
  tie:(a,b)=>a.year-b.year||cmpS(a.name,b.name) };
T.traditions={ label:'Traditions', unit:'traditions',
  cols:[ {k:'name',label:'Tradition',w:1,v:t=>t.name,h:t=>lk('trad',t.id,t.name,'Set the site genre filter to this tradition')},
    {k:'band',label:'Family',v:t=>t.band,w:1},
    {k:'n',label:'Movements',v:t=>t.n,num:1},
    {k:'y0',label:'From',v:t=>t.y0,h:t=>esc(fmtY(t.y0)),num:1},
    {k:'y1',label:'Latest start',v:t=>t.y1,h:t=>esc(fmtY(t.y1)),num:1},
    {k:'regs',label:'Regions',v:t=>t.regs,w:1},
    {k:'movs',label:'Movements in it',v:t=>t.movs,w:2} ],
  rows(){ const q=nrm(S.traditions.q.trim()), on=siteOn(), out=[];
    Object.keys(TRADM).forEach(id=>{ const all=TRADM[id].map(i=>byId[i]).filter(Boolean), m=on?all.filter(n=>inF(n.id)):all; if(!m.length) return;
      const ys=m.map(n=>n.year), t={id,name:TRADN[id]||id,band:bandName[all[0].band]||all[0].band,n:m.length,y0:Math.min(...ys),y1:Math.max(...ys),
        regs:[...new Set(m.map(n=>regName[n.reg]||n.reg))].join(', '),movs:m.slice().sort((a,b)=>a.year-b.year).map(n=>n.name).join(', ')};
      if(!q||nrm(t.name+' '+t.band+' '+t.movs).includes(q)) out.push(t); });
    return out; },
  tie:(a,b)=>cmpS(a.name,b.name) };
const decList=o=>Object.keys(o||{}).map(Number).sort((a,b)=>a-b);
function yearDecs(iso){ const m={}; Object.keys(YEARL[iso]||{}).forEach(y=>{ const d=decOf(+y); m[d]=(m[d]||0)+1; }); return Object.keys(m).map(Number).sort((a,b)=>a-b).map(d=>d+'s ('+m[d]+')').join(', '); }
function eraDecs(iso){ const m={}; decList(ERA[iso]).forEach(d=>m[d]=1); try{ for(const k in ERAX){ if(k.slice(0,3)===iso+'_'&&ERAX[k].songs&&ERAX[k].songs.length) m[+k.slice(3)]=1; } }catch(_){}
  return decList(m).map(d=>d+'s').join(', '); }
const PLV={
  continent:{ unit:'continents', cols:[ {k:'name',label:'Continent',v:r=>r.name,h:r=>lk('reg',r.id,r.name,'Set the site place filter to '+r.name)},
      {k:'nc',label:'Countries',v:r=>r.nc,num:1},{k:'ncity',label:'Cities and areas',v:r=>r.ncity,num:1},{k:'nm',label:'Movements from here',v:r=>r.nm,num:1},{k:'nl',label:'Countries with song lists',v:r=>r.nl,num:1} ],
    all(){ return REG.map(([id,name])=>{ const cs=Object.keys(ISO).filter(i=>ISO[i][1]===id);
      return {id,name,nc:cs.length,ncity:CITIES.filter(c=>isoReg(c.iso2)===id).length,nm:N.filter(n=>n.reg===id).length,nl:cs.filter(i=>YEARL[i]||ERA[i]).length,txt:name}; }); } },
  country:{ unit:'countries', cols:[ {k:'name',label:'Country',v:r=>r.name,h:r=>lk('cty',r.iso,r.name,'Set the site place filter to '+r.name)},
      {k:'iso',label:'Code',v:r=>r.iso},{k:'reg',label:'Continent',v:r=>r.reg},{k:'ncity',label:'Cities and areas',v:r=>r.ncity,num:1},{k:'nm',label:'Movements from here',v:r=>r.nm,num:1},
      {k:'yl',label:'Year lists',w:1,v:r=>r.yl,tip:'Decades with year-by-year chart lists, and how many years in each'},{k:'el',label:'Decade lists',v:r=>r.el,w:1} ],
    all(){ const nc={}, nm={}; CITIES.forEach(c=>nc[c.iso2]=(nc[c.iso2]||0)+1); N.forEach(n=>{ const i=(CNT[n.id]||[])[0]; if(i) nm[i]=(nm[i]||0)+1; });
      return Object.keys(ISO).map(iso=>({iso,name:isoName(iso),reg:regName[isoReg(iso)]||'',ncity:nc[iso]||0,nm:nm[iso]||0,yl:yearDecs(iso),el:eraDecs(iso),txt:isoName(iso)+' '+iso+' '+(regName[isoReg(iso)]||'')})); } },
  city:{ unit:'cities and areas', cols:[ {k:'name',label:'City or area',v:r=>r.name,h:r=>lk('city',r.i,r.name,'Set the site place filter to '+r.name)},
      {k:'country',label:'Country',v:r=>r.country,h:r=>ctyCell(r.iso)},{k:'reg',label:'Continent',v:r=>r.reg},{k:'kind',label:'Kind',v:r=>r.kind},
      {k:'founded',label:'Founded',v:r=>r.founded,h:r=>r.founded==null?'<span class="dmut">unknown</span>':esc(fmtY(r.founded)),num:1,csvv:r=>r.founded==null?'':r.founded},
      {k:'ended',label:'Ended',v:r=>r.ended,h:r=>r.ended==null?'':esc(fmtY(r.ended)),num:1},
      {k:'names',label:'Names over time',v:r=>r.names,w:1},{k:'nm',label:'Movements from here',v:r=>r.nm,num:1} ],
    all(){ const nm={}; N.forEach(n=>{ if(n.place) nm[nrm(n.place)]=(nm[nrm(n.place)]||0)+1; });
      return CITIES.map((c,i)=>{ const names=(c.names||[]).map(x=>x[1]+' (from '+fmtY(x[0])+')').join(', ');
        return {i,iso:c.iso2,name:c.name,country:isoName(c.iso2),reg:regName[isoReg(c.iso2)]||'',kind:c.kind==='area'?'area':'city',founded:c.founded==null||c.founded<=-9999?null:c.founded,ended:c.ended==null?null:c.ended,names,nm:nm[nrm(c.name)]||0,txt:c.name+' '+names+' '+isoName(c.iso2)}; }); } } };
T.places={ label:'Places', unit:'places', get cols(){ return PLV[S.places.level].cols; },
  rows(){ const q=nrm(S.places.q.trim()); return PLV[S.places.level].all().filter(r=>!q||nrm(r.txt).includes(q)); },
  tie:(a,b)=>cmpS(a.name,b.name) };
T.artists={ label:'Artists', unit:'artists',
  cols:[ {k:'artist',label:'Artist',w:1,v:a=>a.artist,h:a=>lk('artist',a.artist,a.artist,'Show this artist’s songs')},
    {k:'n',label:'Songs',v:a=>a.n,num:1},{k:'countries',label:'Countries',v:a=>a.countries,w:2},
    {k:'y0',label:'First year',v:a=>a.y0,num:1},{k:'y1',label:'Last year',v:a=>a.y1,num:1},
    {k:'kinds',label:'Found in',v:a=>a.kinds,w:1},{k:'movs',label:'Movements',v:a=>a.movs,w:1} ],
  rows(){ const pass=songPass(), q=nrm(S.artists.q.trim()), m=new Map();
    index().forEach(r=>{ if(!pass(r)) return; let a=m.get(r.na); if(!a){ a={artist:r.artist,na:r.na,n:0,c:new Set(),k:new Set(),mv:new Set(),y0:null,y1:null}; m.set(r.na,a); }
      a.n++; if(r.iso) a.c.add(isoName(r.iso)); a.k.add(KIND[r.kind]); if(r.mov) a.mv.add(r.mov);
      const y=r.rel!=null?r.rel:(r.kind==='chart'?r.year:null); if(y!=null){ if(a.y0==null||y<a.y0) a.y0=y; if(a.y1==null||y>a.y1) a.y1=y; } });
    const out=[]; m.forEach(a=>{ if(q&&!a.na.includes(q)) return; a.countries=[...a.c].sort().join(', '); a.kinds=[...a.k].join(', '); a.movs=[...a.mv].join(', '); out.push(a); }); return out; },
  tie:(a,b)=>b.n-a.n||cmpS(a.artist,b.artist) };
const TABS=['songs','movements','traditions','places','artists'];

/* ---------- rendering ---------- */
root.innerHTML=`<div class="dhead"><div class="seg" id="dtabs" role="group" aria-label="Which table">${TABS.map(t=>`<button type="button" data-dtab="${t}">${T[t].label}</button>`).join('')}</div>
  <button type="button" class="lbtn" id="dcsv" title="Copy every matching row, not only the ones shown">Copy as CSV</button></div>
  <div class="dctl" id="dctl"></div>
  <p class="dcount" id="dcount" role="status" aria-live="polite"></p>
  <textarea id="dcsvta" class="dcsvta" readonly hidden rows="6" aria-label="CSV of the current table"></textarea>
  <div class="dwrap" id="dwrap" tabindex="0" role="region" aria-label="Results"></div>
  <div class="dfoot"><button type="button" class="lbtn" id="dmore" hidden></button></div>`;
const $=id=>root.querySelector('#'+id);
let ROWS=[], ALL=[], csvT=0;
const opt=(v,l,cur)=>`<option value="${esc(v)}"${String(v)===String(cur)?' selected':''}>${esc(l)}</option>`;
function countBy(key){ const m=new Map(); index().forEach(r=>{ const v=r[key]; if(v) m.set(v,(m.get(v)||0)+1); }); return [...m.entries()]; }
function controls(){ const t=S.tab, o=S[t]; let h='';
  const search=ph=>`<input type="search" id="dq" class="dq" placeholder="${ph}" value="${esc(o.q)}" aria-label="${ph}">`;
  if(t==='songs'){
    const scenes=countBy('scene').sort((a,b)=>cmpS(a[0],b[0])), srcs=countBy('grp').sort((a,b)=>b[1]-a[1]||cmpS(a[0],b[0])), sts=countBy('status').sort((a,b)=>b[1]-a[1]);
    h=search('Search artist or title…')+
      `<label>Kind <select data-o="kind">${opt('','All',o.kind)}${opt('chart','Chart songs',o.kind)}${opt('era','Decade lists',o.kind)}${opt('genre','Genre examples',o.kind)}</select></label>
      <label>Origin <select data-o="origin">${opt('','Any',o.origin)}${opt('home','Home',o.origin)}${opt('foreign','Foreign',o.origin)}</select></label>
      <label>Scene <select data-o="scene">${opt('','Any',o.scene)}${scenes.map(([v,n])=>opt(v,v+' ('+n+')',o.scene)).join('')}</select></label>
      <label>Source <select data-o="src">${opt('','Any',o.src)}${srcs.map(([v,n])=>opt(v,v+' ('+n+')',o.src)).join('')}</select></label>
      <label>List status <select data-o="status">${opt('','Any',o.status)}${sts.map(([v,n])=>opt(v,v+' ('+n+')',o.status)).join('')}</select></label>
      <label>Sort <select data-o="sort">${[['year','Year'],['rank','List order'],['artist','Artist'],['title','Title'],['country','Country']].map(([v,l])=>opt(v,l,o.sort)).join('')}${['year','rank','artist','title','country'].includes(o.sort)?'':opt(o.sort,(T.songs.cols.find(c=>c.k===o.sort)||{}).label||o.sort,o.sort)}</select></label>
      <button type="button" class="lbtn" id="ddir" title="Reverse the order">${o.dir>0?'Ascending ↑':'Descending ↓'}</button>`;
  } else if(t==='places'){
    h=`<span class="seg" role="group" aria-label="Level">${[['continent','Continents'],['country','Countries'],['city','Cities and areas']].map(([v,l])=>`<button type="button" data-lvl="${v}" aria-pressed="${o.level===v}">${l}</button>`).join('')}</span>`+search('Search places…');
  } else h=search(t==='movements'?'Search movements, places, traditions…':t==='traditions'?'Search traditions and their movements…':'Search artists…');
  if(t!=='places') h+=`<label class="dchk"><input type="checkbox" id="dign"${S.ignore?' checked':''}> Ignore the site filters on this page</label>`;
  h+=`<button type="button" class="lbtn" id="dclear">Clear page options</button>`;
  $('dctl').innerHTML=h;
  root.querySelectorAll('#dtabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dtab===t)));
}
function sorted(rows){ const t=T[S.tab], o=S[S.tab], col=t.cols.find(c=>c.k===o.sort)||t.cols[0], d=o.dir;
  const key=r=>{ const v=col.v(r); return v===''||v==null||(col.num&&!isFinite(v))?null:v; };
  return rows.map(r=>[key(r),r]).sort((A,B)=>{ const a=A[0], b=B[0];
    if(a==null||b==null){ if(a==null&&b==null) return t.tie(A[1],B[1]); return a==null?1:-1; }      // blanks always last
    return d*(col.num?a-b:cmpS(a,b))||t.tie(A[1],B[1]); }).map(x=>x[1]); }
/* results are a windowed list: only the rows on screen exist, whatever the count */
let DL=null, CUR=()=>false;
function cellHtml(c,r){ const v=c.v(r); return c.h?c.h(r):(v==null?'':esc(v)); }
function card(r){ const t=T[S.tab], cols=t.cols.filter(c=>!c.csvonly), pk=t.primary||[cols[0].k], p=pk.map(k=>cols.find(c=>c.k===k)).filter(Boolean);
  const rest=cols.filter(c=>!pk.includes(c.k)).map(c=>{ const v=c.v(r); return (v==null||v==='')?'':`<span class="dc" title="${esc(c.label)}">${cellHtml(c,r)}</span>`; }).join('');
  const more=S.tab==='songs'&&r._n>1?`<button type="button" class="dmoreb" data-songk="${esc(r.nq)}" aria-expanded="${S.songs.open===r.nq}" title="This song is in ${r._n} lists">${S.songs.open===r.nq?'Hide lists':'In '+r._n+' lists'}</button>`:'';
  return `<div class="drow${CUR(r)?' dcur':''}${r._sub?' dsub':''}"><div class="d1"><b>${cellHtml(p[0],r)}</b>${p[1]?`<span class="d1b">${cellHtml(p[1],r)}</span>`:''}${more}</div><div class="d2">${rest}</div></div>`; }
function rowDetail(r){ const t=T[S.tab], cols=t.cols.filter(c=>!c.csvonly), pk=t.primary||[cols[0].k], tc=cols.find(c=>c.k===pk[0]);
  UI.detail(String(tc.v(r)==null?'':tc.v(r)),`<div class="rows dprops">${cols.map(c=>{ const v=c.v(r); return (v==null||v==='')?'':`<div class="dprop"><small>${esc(c.label)}</small><span>${cellHtml(c,r)}</span></div>`; }).join('')}</div>`)
    .onclick=e=>{ const a=e.target.closest('button.dlk'); if(a){ UI.sheet.close(); const b=document.createElement('button'); b.className='dlk'; Object.assign(b.dataset,a.dataset); b.hidden=true; root.appendChild(b); b.click(); b.remove(); } }; }
T.songs.primary=['title','artist'];
function results(){ const t=T[S.tab], o=S[S.tab];
  ROWS=ALL=sorted(t.rows());
  let extra='', shown=ROWS.length;
  if(S.tab==='songs'){ const c={chart:0,era:0,genre:0}; ALL.forEach(r=>c[r.kind]++);
    /* one row per song: a song that is in several lists is shown once, with its other lists folded under it */
    const first=new Map(), out=[]; ALL.forEach(r=>{ r._sub=false; const f=first.get(r.nq); if(!f){ r._n=1; first.set(r.nq,r); out.push(r); } else { f._n++; r._n=0; } });
    if(S.songs.open&&first.has(S.songs.open)){ const f=first.get(S.songs.open), at=out.indexOf(f), kids=ALL.filter(r=>r.nq===S.songs.open&&r!==f); kids.forEach(r=>r._sub=true); out.splice(at+1,0,...kids); } else S.songs.open=null;
    ROWS=out; shown=first.size;
    extra=ALL.length===shown?` (${c.chart.toLocaleString()} chart, ${c.era.toLocaleString()} decade list, ${c.genre.toLocaleString()} genre example)`:` in ${ALL.length.toLocaleString()} list entries (${c.chart.toLocaleString()} chart, ${c.era.toLocaleString()} decade list, ${c.genre.toLocaleString()} genre example)`; }
  const unit=S.tab==='places'?PLV[o.level].unit:t.unit, note=S.tab==='places'?'This table lists every place and does not follow the site filters; tap a place to set the site place filter.':siteNote();
  $('dcount').innerHTML=`<b>${shown.toLocaleString()}</b> ${unit}${extra}. <span class="dmut">${esc(note)}</span>`;
  const cur=S.tab==='places'&&STP?(STP.k==='reg'?'reg:'+STP.reg:STP.k==='cty'?'cty:'+STP.iso:STP.k==='city'?'city:'+STP.i:null):null;
  CUR=r=>cur&&(o.level==='continent'?'reg:'+r.id:o.level==='country'?'cty:'+r.iso:'city:'+r.i)===cur;
  const w=$('dwrap');
  if(!ROWS.length){ DL=null; w.classList.remove('vl'); w.innerHTML=`<p class="dempty">Nothing matches.${siteOn()&&S.tab!=='places'?' The site filters above are narrowing this table; tick “Ignore the site filters on this page” to see everything.':''}</p>`; }
  else if(!DL||!w.querySelector('.vl-pad')){ DL=UI.vlist(w,{rowH:62,count:()=>ROWS.length,row:i=>card(ROWS[i])}); }
  else DL.refresh();
  $('dmore').hidden=true;
  // sorting for the tables without their own sort control
  let sx=$('dsortx'); if(!sx){ sx=document.createElement('div'); sx.className='dctl'; sx.id='dsortx'; $('dcount').parentNode.insertBefore(sx,$('dcount')); }
  sx.hidden=S.tab==='songs'; if(S.tab!=='songs'){ const cols=t.cols.filter(c=>!c.csvonly); sx.innerHTML=`<label>Sort <select id="dsel">${cols.map(c=>opt(c.k,c.label,o.sort)).join('')}</select></label><button type="button" class="lbtn" id="ddir2">${o.dir>0?'Ascending ↑':'Descending ↓'}</button>`;
    sx.querySelector('#dsel').onchange=e=>{ o.sort=e.target.value; results(); }; }
  $('dcsvta').hidden=true; clearTimeout(csvT); $('dcsv').textContent='Copy as CSV'; }
function refresh(){ controls(); results(); }
function setSort(k){ const o=S[S.tab]; if(o.sort===k) o.dir=-o.dir; else { o.sort=k; const c=T[S.tab].cols.find(x=>x.k===k); o.dir=c&&c.num&&!['year','rank','rel','y0','y1','founded','ended'].includes(k)?-1:1; } }
function showArtist(name){ S.tab='songs'; Object.assign(S.songs,{q:name,exact:true}); refresh(); root.scrollIntoView({block:'start'}); }
function csv(){ const cols=T[S.tab].cols, q=v=>{ v=v==null?'':String(v); return /[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; };
  return [cols.map(c=>q(c.label)).join(',')].concat(ALL.map(r=>cols.map(c=>q(c.csvv?c.csvv(r):c.v(r))).join(','))).join('\r\n'); }

root.addEventListener('click',e=>{ const a=e.target.closest('button'); if(!a){ const vr=e.target.closest('.vl-row'); if(vr&&!e.target.closest('a')&&ROWS[+vr.dataset.i]) rowDetail(ROWS[+vr.dataset.i]); return; } const d=a.dataset;
  if(d.songk!=null){ S.songs.open=S.songs.open===d.songk?null:d.songk; results(); return; }
  if(d.dtab){ S.tab=d.dtab; refresh(); }
  else if(d.lvl){ S.places.level=d.lvl; S.places.sort='name'; S.places.dir=1; refresh(); }
  else if(d.sort){ setSort(d.sort); if(S.tab==='songs') controls(); results(true); }
  else if(a.id==='ddir'){ S.songs.dir=-S.songs.dir; controls(); results(); }
  else if(a.id==='ddir2'){ const o=S[S.tab]; o.dir=-o.dir; results(); }
  else if(a.id==='dclear'){ const o=S[S.tab]; o.q=''; if(S.tab==='songs') Object.assign(o,{exact:false,kind:'',origin:'',scene:'',src:'',status:'',sort:'year',dir:1}); S.ignore=false; refresh(); }
  else if(a.id==='dcsv'){ const text=csv(), ta=$('dcsvta'), n=ALL.length; clearTimeout(csvT);
    const ok=()=>{ a.textContent=`Copied ${n.toLocaleString()} rows`; csvT=setTimeout(()=>a.textContent='Copy as CSV',1600); };
    const fb=()=>{ ta.value=text; ta.hidden=false; ta.focus(); ta.select(); a.textContent='Selected below: press Ctrl/Cmd+C'; csvT=setTimeout(()=>a.textContent='Copy as CSV',4000); };
    try{ navigator.clipboard.writeText(text).then(ok,fb); }catch(_){ fb(); } }
  else if('artist' in d){ showArtist(d.artist); }
  else if(d.mov){ select(d.mov); location.hash='list'; }
  else if(d.cty){ setPlace({k:'cty',iso:d.cty}); }
  else if(d.reg){ setPlace({k:'reg',reg:d.reg}); }
  else if(d.city!=null&&d.city!==''){ const i=+d.city; setPlace({k:'city',i,iso:CITIES[i].iso2}); }
  else if(d.trad){ FG={k:'trad',id:d.trad}; stApply(); try{ applyHighlight(); }catch(_){} } });
root.addEventListener('input',e=>{ if(e.target.id==='dq'){ const o=S[S.tab]; o.q=e.target.value; if(S.tab==='songs') o.exact=false; results(); } });
root.addEventListener('change',e=>{ const el=e.target;
  if(el.id==='dign'){ S.ignore=el.checked; results(); }
  else if(el.dataset&&el.dataset.o){ const o=S.songs; o[el.dataset.o]=el.value; if(el.dataset.o==='sort'){ o.dir=1; controls(); } results(); } });

let lastSig='';
function show(){ lastSig=sig(); refresh(); }
VIEWHOOK.data=show;
FHOOKS.push(()=>{ if(curView()==='data') results(); });
setInterval(()=>{ try{ if(curView()==='data'&&sig()!==lastSig){ lastSig=sig(); refresh(); } }catch(_){} },4000);   // lists that arrive from the database later
window.DATATAB={ state:S, index, rows:()=>ROWS, refresh, csv, showArtist, show:t=>{ if(T[t]){ S.tab=t; refresh(); } } };
if(curView()==='data') show();
