/* App shell helpers: bottom sheets (one at a time), drag to dismiss, icons. No framework. */
const bd=document.getElementById('sheetbd'); let cur=null;
const ic=n=>`<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
/* One bottom sheet at a time on a phone: while a filter sheet is up, the playlist sheet steps aside (it is not closed, and
   returns when the filter is put away), so the filter chips and the playlist button work like tabs of one sheet. */
function under(on){ const sp=document.getElementById('stpanel'); if(sp) sp.classList.toggle('aside',on&&matchMedia('(max-width:700px)').matches); document.documentElement.classList.toggle('filter-up',on); }
function open(id,o){ o=o||{}; const el=document.getElementById('sheet-'+id); if(!el) return; if(cur&&cur.el!==el) close();
  under(id==='filter');
  cur={el,id,onClose:o.onClose,clear:!!o.clear}; el.hidden=false; el.style.transform=''; el.classList.toggle('peek',!!o.peek);
  // a "clear" sheet has no backdrop at all: nothing invisible ever sits over the app. Tapping elsewhere closes it and the tap still lands.
  bd.hidden=!!o.clear; void el.offsetHeight; el.classList.add('in'); bd.classList.toggle('in',!o.clear); }
function close(id){ if(!cur||(id&&cur.id!==id)) return; const c=cur; cur=null; under(false); c.el.classList.remove('in'); c.el.style.transform=''; bd.classList.remove('in');
  setTimeout(()=>{ if(!cur||cur.el!==c.el) c.el.hidden=true; if(!cur||cur.clear) bd.hidden=true; },280); if(c.onClose){ try{ c.onClose(); }catch(e){} } }
let bdAt=0; const bdClose=e=>{ const t=Date.now(); if(t-bdAt<350) return; bdAt=t; if(e.cancelable&&e.type==='touchend') e.preventDefault(); close(); };
bd.addEventListener('click',bdClose); bd.addEventListener('touchend',bdClose,{passive:false});
document.addEventListener('pointerdown',e=>{ if(!cur||!cur.clear) return; const t=e.target; if(cur.el.contains(t)) return; if(t.closest&&t.closest('[data-keepsheet]')) return; close(); },true);
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&cur) close(); });
document.addEventListener('click',e=>{ if(e.target.closest('[data-close]')) close(); });
// safety net: the backdrop can never outlive its sheet
setInterval(()=>{ if(!cur&&!bd.hidden) bd.hidden=true; },1000);
/* drag a sheet down by its grabber or header to dismiss it */
function draggable(handle,sheet,dismiss){ let y0=null,dy=0;
  handle.addEventListener('pointerdown',e=>{ if(e.target.closest('button,input,select,a')) return; y0=e.clientY; dy=0; sheet.style.transition='none'; try{ handle.setPointerCapture(e.pointerId); }catch(_){} });
  handle.addEventListener('pointermove',e=>{ if(y0==null) return; dy=Math.max(0,e.clientY-y0); sheet.style.transform=`translateY(${dy}px)`; });
  const end=()=>{ if(y0==null) return; y0=null; sheet.style.transition=''; if(dy>70) dismiss(); else sheet.style.transform=''; };
  handle.addEventListener('pointerup',end); handle.addEventListener('pointercancel',end); }
document.querySelectorAll('.sheet').forEach(s=>{ [s.querySelector('.sheet-grab'),s.querySelector('.sheet-head')].forEach(h=>{ if(h) draggable(h,s,()=>close()); }); });
/* No bottom sheet comes closer to the filter row than half that row's height. The limit is measured, since the row's
   place depends on the view and the device, and is kept in --sheet-max for every sheet. */
function sheetMax(){ const fr=document.getElementById('filterrow'); if(!fr) return; const r=fr.getBoundingClientRect(); if(!r.height) return;
  document.documentElement.style.setProperty('--sheet-max',Math.max(240,Math.round(innerHeight-r.bottom-r.height/2))+'px'); }
addEventListener('resize',sheetMax); addEventListener('hashchange',()=>setTimeout(sheetMax,60)); setTimeout(sheetMax,0); setTimeout(sheetMax,600);
/* the playlist panel is a bottom sheet too (not modal: the map stays usable behind it) */
const sp=document.getElementById('stpanel');
if(sp){ const g=document.createElement('div'); g.className='sheet-grab'; sp.insertBefore(g,sp.firstChild); const dis=()=>{ sp.style.transform=''; sp.style.height=''; sp.classList.remove('tall'); const x=document.getElementById('stpclose'); if(x) x.click(); };
  /* The playlist sheet is sized by hand: drag its grabber or header and it follows the finger and stays where it is left,
     so it can be slid down to see the map or tree behind it. Left very low it closes; left near the top limit it snaps to
     the limit. A tap on the grabber switches between the limit and the usual height. The height holds across the tabs. */
  const LOW=150, NEAR=70, maxH=()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sheet-max'))||innerHeight*.8;
  const setH=h=>{ sp.style.height=h==null?'':Math.round(h)+'px'; sp.classList.toggle('tall',h!=null&&h>=maxH()-1); };
  window.STSHEET={ tall:()=>setH(maxH()), reset:()=>setH(null) };
  const size=handle=>{ let y0=null,h0=0,moved=false;
    handle.addEventListener('pointerdown',e=>{ if(e.target.closest('button,input,select,a')) return; y0=e.clientY; h0=sp.offsetHeight; moved=false; sp.style.transition='none'; try{ handle.setPointerCapture(e.pointerId); }catch(_){} });
    handle.addEventListener('pointermove',e=>{ if(y0==null) return; const dy=e.clientY-y0; if(!moved&&Math.abs(dy)<4) return; moved=true; sp.style.height=Math.max(60,Math.min(maxH(),h0-dy))+'px'; });
    const end=()=>{ if(y0==null) return; y0=null; sp.style.transition=''; if(!moved){ if(handle===g) setH(sp.offsetHeight>=maxH()-1?null:maxH()); return; }
      const h=sp.offsetHeight; if(h<LOW){ setH(null); dis(); } else if(h>maxH()-NEAR) setH(maxH()); else setH(h); };
    handle.addEventListener('pointerup',end); handle.addEventListener('pointercancel',end); };
  size(g); const h=sp.querySelector('.sthead'); if(h) size(h);
  const x=document.getElementById('stpclose'); if(x){ x.innerHTML=ic('x'); x.className='sheet-x'; } }
window.UI={ sheet:{open,close,current:()=>cur&&cur.id}, ic };
/* ---- reusable windowed list: only the rows on screen exist, so 10 rows and 100,000 rows cost the same ----
   UI.vlist(host,{rowH, count:()=>n, row:i=>html, scroller?}) -> {refresh(), update(), scrollTo(i)}
   Rows are fixed height and absolutely placed inside a spacer; the scroller is the view the list sits in. */
function vlist(host,opt){ const sc=opt.scroller||host.closest('.wview')||host.parentNode, H=opt.rowH; host.classList.add('vl'); host.innerHTML='<div class="vl-pad"></div>'; const pad=host.firstChild;
  let n=0, a0=-1, b0=-1, raf=0;
  const top=()=>{ const r=host.getBoundingClientRect(), s=sc.getBoundingClientRect(); return r.top-s.top+sc.scrollTop; };
  function paint(force){ raf=0; if(!host.isConnected) return; const st=sc.scrollTop-top(), vh=sc.clientHeight||600; const a=Math.max(0,Math.floor(st/H)-8), b=Math.min(n,Math.ceil((st+vh)/H)+8);
    if(!force&&a===a0&&b===b0) return; a0=a; b0=b; let h=''; for(let i=a;i<b;i++) h+=`<div class="vl-row" style="top:${i*H}px;height:${H}px" data-i="${i}">${opt.row(i)}</div>`; pad.innerHTML=h; }
  const onS=()=>{ if(!raf) raf=requestAnimationFrame(()=>paint(false)); };
  sc.addEventListener('scroll',onS,{passive:true}); window.addEventListener('resize',onS);
  const api={ refresh(){ n=opt.count(); pad.style.height=(n*H)+'px'; a0=b0=-1; paint(true); }, update(){ paint(true); }, scrollTo(i){ sc.scrollTop=top()+i*H; onS(); }, get count(){ return n; } };
  api.refresh(); return api; }
/* swipe a row sideways: UI.swipe(host, {right:{label,cls}, onSwipe(rowEl,i)}) — the row's .sw-in slides, .sw-under shows through */
function swipe(host,o){ let s=null;
  host.addEventListener('pointerdown',e=>{ const row=e.target.closest('.vl-row'); if(!row||e.target.closest('button,input,select,a')) return; s={row,in:row.querySelector('.sw-in'),x:e.clientX,y:e.clientY,dx:0,on:false}; });
  host.addEventListener('pointermove',e=>{ if(!s||!s.in) return; const dx=e.clientX-s.x, dy=e.clientY-s.y; if(!s.on){ if(Math.abs(dx)<12||Math.abs(dx)<Math.abs(dy)*1.4){ if(Math.abs(dy)>14) s=null; return; } s.on=true; s.row.classList.add('swiping'); try{ host.setPointerCapture(e.pointerId); }catch(_){} }
    s.dx=Math.max(0,Math.min(160,dx)); s.in.style.transform=`translateX(${s.dx}px)`; s.row.classList.toggle('sw-go',s.dx>84); });
  const end=()=>{ if(!s) return; const c=s; s=null; if(!c.on) return; c.in.style.transition='transform .2s'; c.in.style.transform=''; setTimeout(()=>{ c.in.style.transition=''; c.row.classList.remove('swiping','sw-go'); },210);
    host._swiped=Date.now(); if(c.dx>84) o.onSwipe(c.row,+c.row.dataset.i); };
  host.addEventListener('pointerup',end); host.addEventListener('pointercancel',end);
  host.addEventListener('click',e=>{ if(host._swiped&&Date.now()-host._swiped<350){ e.stopPropagation(); e.preventDefault(); } },true); }
function detail(title,html){ document.getElementById('dett').textContent=title; const b=document.getElementById('detb'); b.innerHTML=html; open('detail'); return b; }
UI.vlist=vlist; UI.swipe=swipe; UI.detail=detail;
