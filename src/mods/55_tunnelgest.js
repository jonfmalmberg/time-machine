/* Tunnel touch controls: pinch travels through time (spread = into the past, like zooming into a map), one-finger drag scrubs,
   double-tap magnifies a crowded patch of sky (drag to look around, double-tap again to go back). */
const cv=document.getElementById('tunnel'); if(!cv) return;
const TZ={k:1,cx:0,cy:0}; window.TUNZOOM=TZ;
const draw0=tunnelDraw;
tunnelDraw=function(dt){ if(TZ.k<=1.001) return draw0.apply(this,arguments);
  const ctx=cv.getContext('2d'), W=cv.clientWidth, H=cv.clientHeight, k=TZ.k; TZ.cx=Math.max(W/2/k,Math.min(W-W/2/k,TZ.cx)); TZ.cy=Math.max(H/2/k,Math.min(H-H/2/k,TZ.cy));
  const st=ctx.setTransform; ctx.setTransform=function(a,b,c,d,e,f){ if(b===0&&c===0&&e===0&&f===0&&a===d) return st.call(ctx,a*k,0,0,a*k,a*(W/2-k*TZ.cx),a*(H/2-k*TZ.cy)); return st.apply(ctx,arguments); };
  // names keep their normal size on screen while the sky is magnified, so a crowded patch opens up instead of just getting bigger
  const fd=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'font');
  Object.defineProperty(ctx,'font',{configurable:true,get(){ return fd.get.call(ctx); },set(v){ fd.set.call(ctx,String(v).replace(/(\d+(?:\.\d+)?)px/,(m,n)=>(n/k*1.15).toFixed(2)+'px')); }});
  try{ return draw0.apply(this,arguments); } finally{ delete ctx.setTransform; delete ctx.font; } };
const hit0=tunnelHit;
tunnelHit=function(e){ if(TZ.k<=1.001) return hit0(e); const r=cv.getBoundingClientRect(), W=cv.clientWidth, H=cv.clientHeight;
  const x=(e.clientX-r.left-W/2)/TZ.k+TZ.cx, y=(e.clientY-r.top-H/2)/TZ.k+TZ.cy; return hit0({clientX:r.left+x,clientY:r.top+y}); };
const go=u=>{ stopPlay(); setYearU(u); stCompute(); stBarUI(); stKick(); };
const pts=new Map(); let pinch=null, drag=null, moved=false, lastTap=null;
cv.addEventListener('pointerdown',e=>{ pts.set(e.pointerId,{x:e.clientX,y:e.clientY}); if(pts.size===1){ moved=false; drag={x:e.clientX,y:e.clientY,u:stU,cx:TZ.cx,cy:TZ.cy}; }
  if(pts.size===2){ const [p,q]=[...pts.values()]; pinch={d:Math.hypot(p.x-q.x,p.y-q.y),u:stU}; moved=true; } try{ cv.setPointerCapture(e.pointerId); }catch(_){} });
cv.addEventListener('pointermove',e=>{ if(!pts.has(e.pointerId)) return; pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pts.size===2&&pinch){ const [p,q]=[...pts.values()], r=Math.hypot(p.x-q.x,p.y-q.y)/pinch.d; go(pinch.u-Math.log(r)*0.11); return; }
  if(!drag||pts.size!==1) return; const dx=e.clientX-drag.x, dy=e.clientY-drag.y; if(!moved&&Math.hypot(dx,dy)<7) return; moved=true;
  if(TZ.k>1.001){ TZ.cx=drag.cx-dx/TZ.k; TZ.cy=drag.cy-dy/TZ.k; stKick(); } else go(drag.u-dy*0.0011); });
const end=e=>{ pts.delete(e.pointerId); if(pts.size<2) pinch=null; if(pts.size===1){ const p=[...pts.values()][0]; drag={x:p.x,y:p.y,u:stU,cx:TZ.cx,cy:TZ.cy}; } if(!pts.size) drag=null; };
cv.addEventListener('pointerup',e=>{ const was=moved; end(e); if(was||pts.size) return; const t=performance.now(), r=cv.getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top;
  if(lastTap&&t-lastTap.t<320&&Math.hypot(x-lastTap.x,y-lastTap.y)<34){ lastTap=null; moved=true;
    if(TZ.k>1.001) TZ.k=1; else { TZ.cx=x; TZ.cy=y; TZ.k=2.6; } stKick(); setTimeout(()=>{ moved=false; },350); }
  else lastTap={t,x,y}; });
cv.addEventListener('pointercancel',end);
// a drag, pinch or double-tap is not a tap on a star
cv.addEventListener('click',e=>{ if(moved){ e.stopImmediatePropagation(); e.preventDefault(); moved=false; } },true);
const tn=document.querySelector('.tunnote'); if(tn) tn.textContent='You are flying through time, looking back into the past. Every movement is a star: the brighter it burns, the stronger it is at this moment. Stars of one tradition gather into a galaxy; neighbouring galaxies come from the same part of the world. Spread two fingers to fly into the past and pinch to come back; or drag one finger up and down. Double-tap a crowded patch to magnify it, drag to look around, and double-tap again to step back. Tap a star to select it.';
