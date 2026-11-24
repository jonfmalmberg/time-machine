/* Shareable links (roadmap 5.1): the address carries what the person is looking at, built only from stable keys.
     v   view (tree is the default)            p   place, the key form PLKEY makes (cty:JP, reg:eur, city:JP:Osaka, multi:cty:JP+reg:eur)
     y   year (2026 is the default)            s   stay: years either side (0 = just that year), until, or from:<year>
     g   genre filter, the key form GKEY makes tm  made: "born then" instead of "alive then"
     pm  made: "made here" instead of "heard here"     m   home: playlist "made there" instead of "heard there"
     pl  1 = the place-and-time playlist panel is open; a genre id = that genre's playlist is open
     sel the selected genre (left out when pl already names it)
   Defaults are left out. Opening an address applies each value it can read and ignores each it cannot.
   Other parameters in the address (the sign-in return: code, error, invite) are never touched here. */
const OURS=['v','p','y','s','g','tm','pm','m','pl','sel'];
const has=(o,k)=>!!o&&Object.prototype.hasOwnProperty.call(o,k);
const enc=v=>encodeURIComponent(v).replace(/%3A/gi,':').replace(/%2B/gi,'+');
/* read the query by hand: URLSearchParams would turn the "+" between places into a space */
function readQuery(){ const out={}; String(location.search||'').replace(/^\?/,'').split('&').forEach(part=>{ if(!part) return; const i=part.indexOf('='), k=i<0?part:part.slice(0,i), v=i<0?'':part.slice(i+1);
  let kk, vv; try{ kk=decodeURIComponent(k); vv=decodeURIComponent(v); }catch(e){ return; } if(OURS.includes(kk)&&!has(out,kk)) out[kk]=vv; }); return out; }
function others(){ return String(location.search||'').replace(/^\?/,'').split('&').filter(part=>{ if(!part) return false; const k=part.split('=')[0]; let kk; try{ kk=decodeURIComponent(k); }catch(e){ return true; } return !OURS.includes(kk); }); }

/* ---- keys -> state ---- */
let CIDX=null;
const cityIdx=(iso,name)=>{ if(!CIDX){ CIDX=new Map(); CITIES.forEach((c,i)=>CIDX.set(c.iso2+':'+c.name,i)); } const i=CIDX.get(iso+':'+name); return i==null?-1:i; };
function placeOne(t){ const a=t.indexOf(':'); if(a<0) return null; const k=t.slice(0,a), x=t.slice(a+1);
  if(k==='reg') return has(regName,x)?{k:'reg',reg:x}:null;
  if(k==='cty') return has(ISO,x)?{k:'cty',iso:x}:null;
  if(k==='city'){ const b=x.indexOf(':'); if(b<0) return null; const i=cityIdx(x.slice(0,b),x.slice(b+1)); return i>=0?{k:'city',i,iso:CITIES[i].iso2}:null; }
  return null; }
function placeFrom(v){ if(!v) return null; if(v.startsWith('multi:')){ const seen=new Set(), L=[]; v.slice(6).split('+').forEach(t=>{ const p=placeOne(t); if(p){ const k=PLKEY(p); if(!seen.has(k)){ seen.add(k); L.push(p); } } });
    return L.length===0?null:L.length===1?L[0]:{k:'multi',items:L}; }
  return placeOne(v); }
function genreOne(t){ const a=t.indexOf(':'); if(a<0) return null; const k=t.slice(0,a), id=t.slice(a+1);
  if(k==='band') return has(bandName,id)?{k,id}:null; if(k==='trad') return has(TRADM,id)?{k,id}:null; if(k==='mov') return has(byId,id)?{k,id}:null; return null; }
function genreFrom(v){ if(!v) return null; if(v.startsWith('multi:')){ const seen=new Set(), L=[]; v.slice(6).split('+').forEach(t=>{ const g=genreOne(t); if(g&&!seen.has(t)){ seen.add(t); L.push(g); } });
    return L.length===0?null:L.length===1?L[0]:{k:'multi',items:L}; }
  return genreOne(v); }
const intIn=(v,a,b)=>{ if(!/^-?\d{1,5}$/.test(String(v))) return null; const n=+v; return n>=a&&n<=b?n:null; };

/* ---- state -> keys ---- */
const placeKey=p=>!p?'':p.k==='multi'?'multi:'+(p.items||[]).map(PLKEY).filter(Boolean).join('+'):(PLKEY(p)||'');
const genreKey=g=>!g?'':g.k==='multi'?'multi:'+(g.items||[]).map(x=>x.k+':'+x.id).join('+'):(GKEY(g)||'');
const panelShown=()=>{ const p=document.getElementById('stpanel'); return !!p&&!p.hidden; };
function state(){ const o={}, v=curView();
  if(v!=='tree') o.v=v;
  const pk=placeKey(STP); if(pk) o.p=pk;
  if(STY!==T1) o.y=String(STY);
  if(STFROM===T0){ /* until: the default stay */ } else if(STFROM!=null) o.s='from:'+STFROM; else o.s=String(STSPAN);
  const gk=genreKey(FG); if(gk) o.g=gk;
  if(FTM==='made') o.tm='made'; if(FPL==='made') o.pm='made'; if(PMODE==='home') o.m='home';
  if(panelShown()) o.pl=GP!=null?GP:'1';
  if(selected&&o.pl!==selected) o.sel=selected;
  return o; }
const query=o=>OURS.filter(k=>has(o,k)).map(k=>k+'='+enc(o[k])).join('&');
const base=()=>location.href.split('#')[0].split('?')[0];
function shareUrl(){ const q=query(state()); return base()+(q?'?'+q:''); }

/* ---- opening an address ---- */
function applyLink(){ const q=readQuery(), used={};
  if(!Object.keys(q).length) return;
  const place=placeFrom(q.p), y=intIn(q.y,T0,T1), g=genreFrom(q.g);
  let stay=null; if(q.s==='until') stay=['until']; else if(/^from:/.test(q.s||'')){ const f=intIn(q.s.slice(5),T0,T1); if(f!=null) stay=['from',f]; } else { const n=intIn(q.s,0,500); if(n!=null) stay=[n]; }
  const views=typeof VIEWS!=='undefined'?VIEWS:['tree','map','tunnel','list','journey','data','me'];
  let v=views.includes(q.v)?q.v:null;
  const plG=q.pl&&q.pl!=='1'&&has(byId,q.pl)?q.pl:null, plM=q.pl==='1';
  if(plG) v='list';                               // a genre's playlist is shown in the list
  if(place){ STP=place; used.p=placeKey(place); }
  if(y!=null){ setYear(y); used.y=y; }
  if(stay){ if(stay[0]==='from') setStay('from',Math.min(stay[1],STY)); else setStay(stay[0]); used.s=q.s; }
  if(g){ FG=g; used.g=genreKey(g); }
  if(q.tm==='made'){ FTM='made'; used.tm='made'; }
  if(q.pm==='made'){ FPL='made'; used.pm='made'; }
  if(q.m==='home'||q.m==='heard'){ PMODE=q.m; used.m=q.m; }   // this visit only: the person's own saved choice is not overwritten
  if(used.p||used.y!=null||used.s||used.g||used.tm||used.pm){ if(typeof stopPlay==='function') stopPlay(); syncLegend(); stApply(); applyHighlight(); }
  if(v){ used.v=v; if(location.hash.replace('#','')!==v){ try{ history.replaceState(history.state,'',location.href.split('#')[0]+'#'+v); }catch(e){} } showView(v); }
  if(!plG&&has(byId,q.sel||'')){ select(q.sel); used.sel=q.sel; }
  if(plG){ select(plG); if(curView()!=='list') showView('list'); openGenrePlaylist(plG); used.pl=plG; }
  else if(plM){ GP=null; stPanelOpen=true; stBarUI(); stPanelUpdate(); used.pl='1'; }
  if(window.FILTERS&&window.FILTERS.paint){ try{ window.FILTERS.paint(); }catch(e){} }
  if(Object.keys(used).length){ try{ window.TRACK&&window.TRACK('open_link',used); }catch(e){} }
}

/* ---- the address follows what the person does (replaceState, at most twice a second) ---- */
let tmr=0, lastQ=null;
function write(){ tmr=0; let q; try{ q=query(state()); }catch(e){ return; }
  { const w=what(), t=w?w+' · '+SITE:SITE; if(document.title!==t) document.title=t; }
  if(q===lastQ) return; const rest=others(), all=[...rest,...(q?[q]:[])].join('&');
  const next=location.pathname+(all?'?'+all:'')+location.hash;
  if(next===location.pathname+location.search+location.hash){ lastQ=q; return; }
  try{ history.replaceState(history.state,'',next); lastQ=q; }catch(e){} }
const soon=()=>{ if(!tmr) tmr=setTimeout(write,500); };
FHOOKS.push(soon);
{ const sv=showView; showView=function(){ const r=sv.apply(this,arguments); soon(); return r; }; }
{ const sb=stBarUI; stBarUI=function(){ const r=sb.apply(this,arguments); soon(); return r; }; }
{ const se=select; select=function(){ const r=se.apply(this,arguments); soon(); return r; }; }
{ const sm=setPmode; setPmode=function(){ const r=sm.apply(this,arguments); soon(); return r; }; }

/* ---- the one control: Copy link, beside Copy prompt ---- */
const btn=document.getElementById('stlink');
if(btn){ let ta=null;
  btn.onclick=()=>{ const url=shareUrl();
    if(!ta){ ta=document.createElement('textarea'); ta.readOnly=true; ta.setAttribute('aria-hidden','true'); ta.tabIndex=-1; ta.style.cssText='position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0'; btn.parentNode.appendChild(ta); }
    ta.value=url; copyText(btn,url,ta);
    try{ const o=state(); delete o.v; if(window.TRACK) window.TRACK('share',Object.assign({v:curView()},o)); }catch(e){} }; }

/* ---- Share, in the top bar: the system share sheet where there is one (phones), otherwise the link is copied ---- */
/* the view in words, "Canada · 1980–2020 · Country": the tab title, the share sheet and the copy confirmation all say it */
const NAMES={ cty:x=>has(ISO,x)?ISO[x][0]:undefined, reg:x=>has(regName,x)?regName[x]:undefined, mov:x=>has(byId,x)?byId[x].name:undefined, band:x=>has(bandName,x)?bandName[x]:undefined, trad:x=>typeof TRADN!=='undefined'&&has(TRADN,x)?TRADN[x]:undefined, t1:T1 };
const what=()=>{ try{ return LINKTITLE(state(),NAMES); }catch(e){ return ''; } };
const SITE='World Music Time Machine';
let tip=null, tipT=0;
function say(t){ if(!tip){ tip=document.createElement('div'); tip.className='sharetip'; tip.setAttribute('role','status'); document.body.appendChild(tip); } tip.textContent=t; tip.classList.add('on'); clearTimeout(tipT); tipT=setTimeout(()=>tip.classList.remove('on'),1800); }
const sb=document.getElementById('shareb');
if(sb){ sb.onclick=()=>{ const url=shareUrl(), title=what();
    try{ const o=state(); delete o.v; if(window.TRACK) window.TRACK('share',Object.assign({v:curView(),via:'top'},o)); }catch(e){}
    const copy=()=>{ try{ navigator.clipboard.writeText(url).then(()=>say(title?'Link copied: '+title:'Link copied'),()=>say('Could not copy the link')); }catch(e){ say('Could not copy the link'); } };
    if(navigator.share&&matchMedia('(pointer:coarse)').matches){ navigator.share({title:title?title+' · '+SITE:SITE,text:title||SITE,url}).catch(e=>{ if(!e||e.name!=='AbortError') copy(); }); } else copy(); }; }

window.LINKS={ url:shareUrl, state, apply:applyLink };
/* after every module has loaded, so the views they add or wrap are in place */
setTimeout(()=>{ try{ applyLink(); }catch(e){ console.error('links',e); } write(); },0);
