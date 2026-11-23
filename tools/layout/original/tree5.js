/* ---------- tree: one fixed layout; zoom only changes scale, line weights and which names show ---------- */
const LAY=DATA.layout, EDGES=DATA.edges, TIER=DATA.tier, TRADN=DATA.trad, TRAD_OF=DATA.tradOf, MEND=DATA.ends;
const TRADM={}; for(const id in TRAD_OF) (TRADM[TRAD_OF[id]]=TRADM[TRAD_OF[id]]||[]).push(id);
const TSTART={}, TEND={}, TREG={};
for(const t in TRADM){ const ms=TRADM[t].slice().sort((a,b)=>byId[a].year-byId[b].year); TSTART[t]=byId[ms[0]].year; TEND[t]=ms.some(m=>MEND[m]==null)?null:Math.max(...ms.map(m=>MEND[m])); TREG[t]=byId[ms[0]].reg; }
const W0=1640, X0=190, X1=1450, PITCH=6, HEAD=24, LANEGAP=6, PADB=6, AXH=28, SMAX=8;
const ZL={1:1,2:1.8,3:3};
const T0=-1500, T1=2026;
const lg = y => Math.log((2056 - Math.min(T1,Math.max(T0,y)))/30);
const L0 = lg(T0);
const sx = y => X1 - (lg(y)/L0)*(X1 - X0);
const svgNS='http://www.w3.org/2000/svg';
const el=(tag,attrs={},parent)=>{ const e=document.createElementNS(svgNS,tag); for(const k in attrs) e.setAttribute(k,attrs[k]); if(parent) parent.appendChild(e); return e; };
let s=0.75, tx=0, ty=AXH, nodeEls={}, linkEls=[], lifeEls=[], gB, gG, gS, gF, gL, gN, gA, built=false;
const TICKCAND=[-1500,-1000,-500,0,250,500,750,1000,1100,1200,1300,1400,1500,1600,1650,1700,1750,1800,1825,1850,1875,1900,1910,1920,1930,1940,1950,1955,1960,1965,1970,1975,1980,1985,1990,1995,2000,2005,2010,2015,2020,2025];
// fixed geometry: each lane has a top in row units (scales with zoom) plus a constant pixel offset for headers and gaps
const GEO=(()=>{ let rows=0, px=0; const bands=[], lanes=[], top={};
  LAY.bandOrder.forEach(b=>{ const ls=LAY.laneOrder[b]; if(!ls||!ls.length) return; const b0={rows,px}; px+=HEAD;
    ls.forEach(t=>{ top[t]={rows,px}; lanes.push({t,rows,px,n:LAY.R[t]}); rows+=LAY.R[t]; px+=LANEGAP; }); px+=PADB; bands.push({b,r0:b0.rows,p0:b0.px,r1:rows,p1:px}); });
  return {bands,lanes,top,rows,px}; })();
const box=()=>document.getElementById('treebox');
const pxk=()=>Math.min(1,s);                       // headers and gaps shrink a little when zoomed far out
const hx=()=>Math.max(s, fitW());                   // horizontal scale never drops below fit-to-width
const fitW=()=>Math.min(1, box().clientWidth/W0);
const fitH=()=>{ const h=box().clientHeight-AXH-10; let lo=0.05, hi=3; for(let i=0;i<30;i++){ const m=(lo+hi)/2; (GEO.rows*PITCH*m+GEO.px*Math.min(1,m)<=h)?lo=m:hi=m; } return lo; };
const smin=()=>Math.min(fitH(), 0.75);
const YR=(rows,px)=>ty+rows*PITCH*s+px*pxk();
const SX=id=>sx(byId[id].year)*hx()+tx;
const SY=id=>{ const t=GEO.top[TRAD_OF[id]]; return YR(t.rows+LAY.row[id]+0.5,t.px); };
const clamp01=v=>Math.max(0,Math.min(1,v));
// how far a tier has "arrived" at the current zoom: 0 = pencil line only, 1 = full dot and name
const arrive=t=>clamp01((s/ZL[t]-0.6)/0.4);

function buildTree(){
  const svg=document.getElementById('tree'); svg.innerHTML='';
  gB=el('g',{},svg); gG=el('g',{class:'grid'},svg); gS=el('g',{},svg); gF=el('g',{},svg); gL=el('g',{},svg); gN=el('g',{},svg); gA=el('g',{class:'axis'},svg);
  nodeEls={}; lifeEls=[]; linkEls=[];
  N.forEach(n=>{
    const e=MEND[n.id]==null?2026:MEND[n.id];
    lifeEls.push({id:n.id,end:Math.max(e,n.year),path:el('line',{class:'life',stroke:regColor(n.reg)},gF)});
    const g=el('g',{class:'node',tabindex:0,role:'button','aria-label':n.name},gN);
    el('circle',{r:5,fill:regColor(n.reg)},g);
    const t=el('text',{x:9,y:4},g); t.textContent=n.name;
    const tt=el('title',{},g); tt.textContent=`${n.name} · ${fmtYear(n.year)} · ${n.place}`+(NOTES[n.id]?`\n${NOTES[n.id]}`:'');
    g.addEventListener('click',e=>{ e.stopPropagation(); if(!dragMoved) select(n.id); });
    g.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();select(n.id);} });
    nodeEls[n.id]=g;
  });
  EDGES.slice().sort((a,b)=>a[2]-b[2]).forEach(([a,b,w])=>{
    const branch=w>=1 && TRAD_OF[a]!==TRAD_OF[b] && TRADM[TRAD_OF[b]].every(m=>byId[m].year>=byId[b].year);
    const under=branch?el('path',{class:'branch',stroke:regColor(byId[a].reg)},gL):null;
    linkEls.push({path:el('path',{class:'link '+(w>=1?'p':'s'),stroke:regColor(byId[a].reg)},gL),under,from:a,to:b,tier:Math.max(TIER[a],TIER[b])});
  });
  if(!built){ s=Math.max(smin(),Math.min(0.75,fitW())); tx=0; ty=AXH; built=true; }
  clampView(); render(); applyHighlight();
}
function clampView(){
  const b=box(), cw=W0*hx(), ch=GEO.rows*PITCH*s+GEO.px*pxk();
  tx = cw<=b.clientWidth ? (b.clientWidth-cw)/2 : Math.min(0, Math.max(b.clientWidth-cw, tx));
  ty = ch<=b.clientHeight-AXH ? AXH : Math.min(AXH, Math.max(b.clientHeight-ch-8, ty));
}
function setScale(ns, fx, fy){
  ns=Math.max(smin(), Math.min(SMAX, ns));
  // keep the point under the cursor fixed (in data terms) while zooming
  const ox=(fx-tx)/hx(), oy=fy;
  let anchor=null, best=1e9; for(const id in nodeEls){ const d=Math.abs(SY(id)-fy)+Math.abs(SX(id)-fx)*0.2; if(d<best){best=d;anchor=id;} }
  const ay=anchor?SY(anchor):fy;
  s=ns; tx=fx-ox*hx();
  if(anchor) ty+=ay-SY(anchor);
  clampView(); render();
}
function render(){
  const b=box(), W=b.clientWidth, Hh=b.clientHeight, H=hx();
  gB.innerHTML='';
  GEO.bands.forEach((bd,i)=>{ const y=YR(bd.r0,bd.p0), h=YR(bd.r1,bd.p1)-y;
    if(i%2===0) el('rect',{x:0,y,width:W,height:h,class:'bandrect'},gB);
    if(h>14){ const t=el('text',{x:12,y:y+Math.min(16,h-2),class:'bandlabel'},gB); t.textContent=bandName[bd.b]; } });
  gG.innerHTML=''; gA.innerHTML='';
  el('rect',{x:0,y:0,width:W,height:AXH,class:'axisbg'},gA);
  let last=-1e9;
  TICKCAND.forEach(t=>{ const x=sx(t)*H+tx; if(x<-20||x>W+20||x-last<46) return; last=x;
    el('line',{x1:x,x2:x,y1:AXH,y2:Hh,'stroke-dasharray':'2 4'},gG);
    const tt=el('text',{x,y:18,'text-anchor':'middle'},gA); tt.textContent=t<0?(-t)+' BCE':(t===0?'1 CE':t); });
  // tradition streams
  gS.innerHTML='';
  GEO.lanes.forEach(ln=>{ const t=ln.t, x0=sx(TSTART[t])*H+tx-8, x1=sx(TEND[t]==null?2026:TEND[t])*H+tx+6, y=YR(ln.rows,ln.px), hh=Math.max(ln.n*PITCH*s,3);
    el('rect',{x:x0,y:y+0.5,width:Math.max(0,x1-x0),height:Math.max(1,hh-1),rx:Math.min(8,hh/2),class:'stream',fill:regColor(TREG[t])},gS);
    if(TRADM[t].length>1 && s>=0.45){ const tl=el('text',{x:x0-6,y:y+Math.min(hh/2,9*Math.max(1,s))+4,'text-anchor':'end',class:'tradlabel'},gS); tl.textContent=TRADN[t]; } });
  // movement bars: important movements thick when zoomed out; all converge to the same weight when zoomed in
  const k=clamp01(Math.log(s/0.3)/Math.log(3/0.3));
  const wt={1:4.5-1.5*k, 2:1.1+1.9*k, 3:0.5+2.5*k};
  lifeEls.forEach(l=>{ const y=SY(l.id).toFixed(1), t=TIER[l.id]; l.path.setAttribute('x1',SX(l.id).toFixed(1)); l.path.setAttribute('x2',(sx(l.end)*H+tx).toFixed(1)); l.path.setAttribute('y1',y); l.path.setAttribute('y2',y); l.path.setAttribute('stroke-width',wt[t].toFixed(2)); l.path.style.opacity=(0.25+0.35*(t===1?1:arrive(t))).toFixed(2); });
  N.forEach(n=>{ const g=nodeEls[n.id], a=arrive(TIER[n.id]);
    if(a<=0.01){ g.style.display='none'; return; }
    g.style.display=''; g.style.opacity=a.toFixed(2);
    g.setAttribute('transform',`translate(${SX(n.id).toFixed(1)},${SY(n.id).toFixed(1)})`);
    g.querySelector('text').setAttribute('font-size',(11.5*Math.min(1,0.7+0.3*a)*Math.min(1,s/0.75+0.25)).toFixed(2)); });
  linkEls.forEach(l=>{ const ax=SX(l.from), ay=SY(l.from), bx=SX(l.to), by=SY(l.to);
    const d=Math.max(0,Math.min(56, bx-ax)), x0=bx-d, mx=x0+d/2;
    const dd=`M${x0.toFixed(1)},${ay.toFixed(1)} C${mx.toFixed(1)},${ay.toFixed(1)} ${mx.toFixed(1)},${by.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`;
    l.path.setAttribute('d',dd); if(l.under) l.under.setAttribute('d',dd);
    const a=l.tier===1?1:Math.max(0.25,arrive(l.tier)); l.path.style.opacity=l.path.classList.contains('hot')?'':(a*(l.path.classList.contains('p')?0.5:0.35)).toFixed(2); });
  const vis=N.filter(n=>arrive(TIER[n.id])>0.5).length;
  document.getElementById('zlevel').textContent=`${vis} of ${N.length} named`+(vis<N.length?' · zoom in for more':'');
}
function applyHighlight(){
  let keep=null, hot=null;
  if(selected){
    const {anc,des}=lineage(selected);
    const up=new Set([selected,...anc]), down=new Set([selected,...des]);
    keep=new Set([...up,...down]);
    hot=l=>(up.has(l.from)&&up.has(l.to))||(down.has(l.from)&&down.has(l.to));
  } else if(regFocus){
    keep=new Set(N.filter(n=>n.reg===regFocus).map(n=>n.id));
    hot=l=>keep.has(l.from)||keep.has(l.to);
  }
  const touched=new Set();
  if(regFocus && !selected) linkEls.forEach(l=>{ if(hot(l)){ touched.add(l.from); touched.add(l.to);} });
  for(const id in nodeEls){ nodeEls[id].classList.toggle('dim', !!keep && !keep.has(id) && !touched.has(id)); nodeEls[id].classList.toggle('sel', id===selected); }
  linkEls.forEach(l=>{ const h=hot?hot(l):false; l.path.classList.toggle('hot',h); l.path.classList.toggle('dim',!!hot&&!h); if(l.under) l.under.classList.toggle('dim',!!hot&&!h); });
  lifeEls.forEach(l=>{ const on=!keep||keep.has(l.id)||touched.has(l.id); l.path.classList.toggle('dim',!on); l.path.classList.toggle('hot',!!keep&&keep.has(l.id)); });
  if(gN) render();
}
function focusTree(id){
  const b=box(); if(!b.clientWidth) return;
  const need=ZL[TIER[id]];
  if(s<need) setScale(need, b.clientWidth/2, b.clientHeight/2);
  const x=SX(id), y=SY(id);
  if(x<40||x>b.clientWidth-200||y<AXH+20||y>b.clientHeight-30){ tx+=b.clientWidth/2-x; ty+=b.clientHeight/2-y; clampView(); render(); }
}
let dragMoved=false;
(function(){
  const b=document.getElementById('treebox'); const pts=new Map(); let start=null, pinch=null;
  b.addEventListener('wheel',e=>{ e.preventDefault(); const r=b.getBoundingClientRect();
    const k=Math.exp(-e.deltaY*(e.ctrlKey?0.012:0.0018)); setScale(s*k, e.clientX-r.left, e.clientY-r.top); },{passive:false});
  b.addEventListener('pointerdown',e=>{ if(e.target.closest('.zoombar')) return; b.setPointerCapture(e.pointerId); pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    dragMoved=false; start={x:e.clientX,y:e.clientY,tx,ty};
    if(pts.size===2){ const [p,q]=[...pts.values()]; pinch={d:Math.hypot(p.x-q.x,p.y-q.y),s}; } });
  b.addEventListener('pointermove',e=>{ if(!pts.has(e.pointerId)) return; pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    const r=b.getBoundingClientRect();
    if(pts.size===2&&pinch){ const [p,q]=[...pts.values()]; const d=Math.hypot(p.x-q.x,p.y-q.y); dragMoved=true; setScale(pinch.s*d/pinch.d,(p.x+q.x)/2-r.left,(p.y+q.y)/2-r.top); return; }
    if(!start) return; const dx=e.clientX-start.x, dy=e.clientY-start.y;
    if(Math.abs(dx)+Math.abs(dy)>4) dragMoved=true;
    if(dragMoved){ tx=start.tx+dx; ty=start.ty+dy; clampView(); render(); } });
  const end=e=>{ pts.delete(e.pointerId); if(pts.size<2) pinch=null; if(!pts.size){ start=null; } };
  b.addEventListener('pointerup',e=>{ const wasDrag=dragMoved; end(e); if(!wasDrag && !e.target.closest('.node') && !e.target.closest('.zoombar') && selected) select(null); setTimeout(()=>dragMoved=false,0); });
  b.addEventListener('pointercancel',end);
  b.addEventListener('dblclick',e=>{ if(e.target.closest('.zoombar')) return; const r=b.getBoundingClientRect(); setScale(s*1.8,e.clientX-r.left,e.clientY-r.top); });
  document.getElementById('zin').onclick=()=>setScale(s*1.5,b.clientWidth/2,b.clientHeight/2);
  document.getElementById('zout').onclick=()=>setScale(s/1.5,b.clientWidth/2,b.clientHeight/2);
  document.getElementById('zfit').onclick=()=>{ s=smin(); tx=0; ty=AXH; clampView(); render(); };
  window.addEventListener('resize',()=>{ if(!document.getElementById('view-tree').hidden){ s=Math.max(s,smin()); clampView(); render(); } });
})();

