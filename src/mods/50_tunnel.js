/* Time tunnel, galaxy formations.
   Every tradition is a galaxy with a fixed centre on a sky map of the world (Americas left, Europe top, Africa bottom,
   Asia right, Oceania lower right) and a fixed internal shape (core + logarithmic spiral arms, or a small elliptical or
   irregular cluster). Everything that does not depend on time is computed once, here. Replaces tunnelDraw. */
const TAU=Math.PI*2;
// where each world region sits in the unit disc (y grows downward)
const ANCH={eur:[.02,-.6], nam:[-.6,-.36], carib:[-.66,.12], latam:[-.42,.58], afr:[.14,.64], mena:[.4,-.1],
  casia:[.52,-.44], sasia:[.62,.12], easia:[.8,-.2], seasia:[.62,.5]};
const R_IN=.18, R_OUT=.98;
const med=a=>{ a=a.slice().sort((x,y)=>x-y); const k=a.length>>1; return a.length%2?a[k]:(a[k-1]+a[k])/2; };
const GAL={};                 // tradition -> galaxy
const GS={};                  // movement id -> {g, ox, oy, lx} offset from its galaxy centre, in disc units

/* ---- 1. galaxy sizes and centres ---- */
{ const ts=Object.keys(TRADM);
  let sum=0; ts.forEach(t=>{ const m=TRADM[t].length; sum+=m>1?Math.pow(m,.9):.42; });
  const k0=Math.sqrt(.47*(R_OUT*R_OUT-R_IN*R_IN)/sum);
  const regs={};
  ts.forEach(t=>{ const ids=TRADM[t], m=ids.length, reg=TREG[t], oce=reg==='seasia';
    const lon=med(ids.map(id=>{ const l=byId[id].lon; return oce&&l<-100?l+360:l; })), lat=med(ids.map(id=>byId[id].lat));
    const g=GAL[t]={t, m, reg, r:m>1?k0*Math.pow(m,.45):k0*.65, lon, lat, x:0, y:0};
    g.w=g.r*g.r; (regs[reg]=regs[reg]||[]).push(g); });
  const all=ts.map(t=>GAL[t]);
  for(const r in regs){ const gs=regs[r], A=ANCH[r]||[0,.5]; let W=0, ml=0, ma=0; gs.forEach(g=>{ W+=g.w; ml+=g.lon*g.w; ma+=g.lat*g.w; }); ml/=W; ma/=W;
    const spread=Math.sqrt(W)*1.5;                      // roughly the radius the region will need
    gs.forEach(g=>{ let dx=(g.lon-ml)/60, dy=-(g.lat-ma)/40; const d=Math.hypot(dx,dy); if(d>1){ dx/=d; dy/=d; }
      g.dx=dx*spread*.8+(hash01('gx'+g.t)-.5)*.02; g.dy=dy*spread*.8+(hash01('gy'+g.t)-.5)*.02; g.x=A[0]+g.dx; g.y=A[1]+g.dy; }); }
  const bound=g=>{ const d=Math.hypot(g.x,g.y)||1e-6, lo=R_IN+g.r, hi=R_OUT-g.r; if(d<lo){ g.x*=lo/d; g.y*=lo/d; } else if(d>hi){ g.x*=hi/d; g.y*=hi/d; } };
  const collide=(soft)=>{ for(let i=0;i<all.length;i++){ const a=all[i]; for(let j=i+1;j<all.length;j++){ const b=all[j];
      const gap=a.reg===b.reg?.006:.034, need=a.r+b.r+gap; let dx=b.x-a.x, dy=b.y-a.y; if(Math.abs(dx)>need||Math.abs(dy)>need) continue;
      let d=Math.hypot(dx,dy); if(d>=need) continue; if(d<1e-5){ dx=hash01(a.t+b.t)-.5; dy=hash01(b.t+a.t)-.5; d=Math.hypot(dx,dy)||1; }
      const push=(need-d)*soft/d, fa=b.w/(a.w+b.w), fb=1-fa; a.x-=dx*push*fa; a.y-=dy*push*fa; b.x+=dx*push*fb; b.y+=dy*push*fb; } } };
  const ITER=420;
  for(let it=0;it<ITER;it++){ const cool=1-it/ITER;
    if(it<ITER-40) for(const r in regs){ const gs=regs[r], A=ANCH[r]||[0,.5]; let W=0, mx=0, my=0; gs.forEach(g=>{ W+=g.w; mx+=g.x*g.w; my+=g.y*g.w; }); mx/=W; my/=W;
      const ax=(A[0]-mx)*.04, ay=(A[1]-my)*.04;           // the region drifts back toward its place on the sky map
      gs.forEach(g=>{ g.x+=ax+(mx+g.dx*.5-g.x)*.05*cool; g.y+=ay+(my+g.dy*.5-g.y)*.05*cool; }); }   // and its galaxies keep together
    collide(.6); collide(.6); all.forEach(bound); }
  for(let it=0;it<30;it++){ collide(1); all.forEach(bound); }
}

/* ---- 2. the shape of each galaxy and the fixed place of each star in it ---- */
for(const t in GAL){ const g=GAL[t], m=g.m, h=s=>hash01(s+t);
  const ids=TRADM[t].slice().sort((a,b)=>(SC[b][0]-SC[a][0])||(byId[a].year-byId[b].year)||(a<b?-1:1));
  g.tilt=h('tilt')*TAU; g.hand=h('hand')<.5?-1:1; g.ct=Math.cos(g.tilt); g.st=Math.sin(g.tilt);
  const loc=[];                                           // local positions in units of the galaxy radius, before squash and tilt
  if(m===1){ g.type='lone'; g.q=1; loc.push([ids[0],0,0]); }
  else if(m<5){ g.type=h('type')<.6?'ell':'irr';
    if(g.type==='ell'){ g.q=.5+.28*h('q'); loc.push([ids[0],0,0]); const a0=h('a0')*TAU;
      for(let i=1;i<m;i++){ const a=a0+TAU*(i-1)/(m-1)+(h('ja'+i)-.5)*.7, r=.55+.35*h('jr'+i); loc.push([ids[i],Math.cos(a)*r,Math.sin(a)*r]); } }
    else { g.q=.72+.28*h('q'); const a0=h('a0')*TAU;
      for(let i=0;i<m;i++){ const a=a0+TAU*i/m+(h('ja'+i)-.5)*1.3, r=i===0?.12+.2*h('jr0'):.4+.52*h('jr'+i); loc.push([ids[i],Math.cos(a)*r,Math.sin(a)*r]); } } }
  else { g.type='spiral'; g.q=.56+.34*h('q'); g.arms=m>=14?3:2; g.wind=2.5+1.3*h('wind'); g.a0=h('a0')*TAU;
    const nc=m<8?1:m<16?2:m<26?3:4, RI=.3, LN=Math.log(1/RI);
    g.arm=(j,r)=>g.a0+TAU*j/g.arms+g.hand*g.wind*Math.log(Math.max(r,.05)/RI)/LN;      // logarithmic spiral: the angle grows with ln(r)
    for(let i=0;i<nc;i++){ if(i===0){ loc.push([ids[0],0,0]); continue; } const a=g.a0+TAU*(i-1)/(nc-1)+.9, r=.17; loc.push([ids[i],Math.cos(a)*r,Math.sin(a)*r]); }
    const rest=ids.slice(nc).sort((a,b)=>(byId[a].year-byId[b].year)||(a<b?-1:1)), n=rest.length;       // the arms grow outward through time
    rest.forEach((id,k)=>{ const f=(k+.5)/n, r=(RI+.04+(1-RI-.04)*Math.pow(f,.85))*(1+(hash01(id+'jr')-.5)*.07), a=g.arm(k%g.arms,r)+(hash01(id+'ja')-.5)*.16;
      loc.push([id,Math.cos(a)*r,Math.sin(a)*r]); });
    // dust lanes: the arms as paths, in the galaxy's own frame (drawn under a tilt + squash transform)
    g.lane=new Path2D(); for(let j=0;j<g.arms;j++){ for(let s=0;s<=18;s++){ const r=.16+(1.08-.16)*s/18, a=g.arm(j,r); if(s===0) g.lane.moveTo(Math.cos(a)*r,Math.sin(a)*r); else g.lane.lineTo(Math.cos(a)*r,Math.sin(a)*r); } }
  }
  // dust motes: along the arms for a spiral, a loose swarm otherwise
  const nd=m<2?0:g.type==='spiral'?Math.min(40,10+2*m):Math.min(14,4+3*m); g.dust=[];
  for(let k=0;k<nd;k++) g.dust.push({f:h('df'+k), j:k%(g.arms||1), da:(h('da'+k)+h('db'+k)-1)*.34, a:h('dc'+k)*TAU, s:.7+.8*h('ds'+k)});
  g.ey=Math.sqrt(g.st*g.st+g.q*g.q*g.ct*g.ct);            // half-height of the tilted, squashed disc, in galaxy radii
  loc.forEach(([id,lx,ly])=>{ ly*=g.q; const ox=(lx*g.ct-ly*g.st)*g.r, oy=(lx*g.st+ly*g.ct)*g.r;
    GS[id]={g, ox, oy, lr:Math.hypot(lx,ly/g.q), side:m>1?(Math.abs(ox)>g.r*.08?Math.sign(ox):0):0}; });
}
window.TUNGAL=GAL; window.TUNSTAR=GS;

/* ---- 3. drawing ---- */
tunnelDraw = function(dt){
  const cv=document.getElementById('tunnel'); if(!cv) return;
  const dpr=Math.min(2,window.devicePixelRatio||1), W=cv.clientWidth, H=cv.clientHeight; if(!W||!H) return;
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){ cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); }
  const ctx=cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
  const bg=css('--tun-bg'), fg=css('--tun-fg'), ring=css('--tun-ring'), body=css('--body'), mono=css('--mono'), tnow=performance.now()/1000;
  // speed through time drives every streak, whatever moved the clock
  const vel=dt?(stU-TUNU)/dt:0; TUNU=stU; TUNV+=(vel-TUNV)*Math.min(1,dt*6);
  ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1; ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  const cx=W/2, cy=H/2, R0=Math.min(W,H)*.5, K=15, ZMAX=7.5, cu=stU, deep=1-cu;
  // the sky map is stretched to the shape of the view (galaxy centres only: the galaxies themselves stay undistorted)
  const EX=Math.min(1.75,Math.max(1,(W/H)*.93)), EY=Math.min(1.3,Math.max(1,(H/W)*.93)), SK=Math.max(.62,Math.min(1,R0/400));
  const speed=Math.min(1,Math.abs(TUNV)*32), dir=TUNV>=0?1:-1;          // 0 at rest, 1 at full speed; forward in time sends the past inward
  const tail=speed*.75;                                                  // streak length as a share of the distance from the centre
  // the source: a point of light at the vanishing point, brighter the further back you are
  const glowR=R0*(.05+.55*Math.pow(deep,1.6))+speed*R0*.25, glowA=.12+.85*Math.pow(deep,1.3);
  const gr=ctx.createRadialGradient(cx,cy,0,cx,cy,glowR); gr.addColorStop(0,`rgba(255,250,235,${glowA})`); gr.addColorStop(.25,`rgba(255,214,150,${glowA*.55})`); gr.addColorStop(1,'rgba(120,140,255,0)');
  ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(cx,cy,glowR,0,TAU); ctx.fill();
  ctx.fillStyle=`rgba(255,255,255,${.35+.65*Math.pow(deep,1.2)})`; ctx.beginPath(); ctx.arc(cx,cy,1.5+5*Math.pow(deep,2),0,TAU); ctx.fill();
  const zOf=u=>1+Math.max(0,cu-u)*K, fadeZ=z=>Math.max(0,1-(z-1)/(ZMAX-1));
  // a streak from a point, trailing behind the motion along its line to the vanishing point: outward when the past is falling away, inward when it rushes back
  const ray=(x,y,frac,w,col,a)=>{ const k=Math.max(-1,dir*frac), x1=x+(x-cx)*k, y1=y+(y-cy)*k; if(Math.abs(x1-x)+Math.abs(y1-y)<.8) return;
    const g=ctx.createLinearGradient(x,y,x1,y1); g.addColorStop(0,col); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.globalAlpha=a; ctx.strokeStyle=g; ctx.lineWidth=w; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x1,y1); ctx.stroke(); };
  ctx.lineCap='round'; ctx.globalCompositeOperation='lighter';
  // the field of distant stars
  STARS.forEach(st=>{ if(st.u>cu) return; const z=zOf(st.u); if(z>ZMAX) return; const r=R0*st.r/z*1.15, a=fadeZ(z), x=cx+Math.cos(st.a)*r*EX, y=cy+Math.sin(st.a)*r*EY;
    const tw=.75+.25*Math.sin(tnow*(1.2+st.w)+st.c*30), col=st.c<.12?'#ffd9a8':st.c>.9?'#a9c4ff':ring, w=Math.max(.5,1.5*st.w/z);
    if(tail>0.01) ray(x,y,tail*(.5+.6*st.w),w,col,(.3+.5*a)*tw);
    ctx.globalAlpha=(.22+.5*a)*tw; ctx.fillStyle=col; ctx.beginPath(); ctx.arc(x,y,w*.75,0,TAU); ctx.fill(); });
  ctx.globalCompositeOperation='source-over';
  ctx.font='500 11px '+mono; ctx.textAlign='center';
  let lastR=1e9;
  TICKCAND.forEach(t=>{ if(t>STYf) return; const z=zOf(U(t)); if(z>ZMAX) return; const r=R0*.98/z; if(lastR-r<14) return;
    const a=fadeZ(z); ctx.globalAlpha=.05+.2*a; ctx.strokeStyle=ring; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(cx,cy,r*EX,r*EY,0,0,TAU); ctx.stroke();
    ctx.globalAlpha=.25+.5*a; ctx.fillStyle=fg; ctx.fillText(fmtY(t),cx,cy-r*EY-4); lastR=r; });
  ctx.globalAlpha=.13; ctx.fillStyle=fg; ctx.font=`600 ${Math.round(Math.min(W,H)*.13)}px ${mono}`; ctx.textBaseline='middle';
  ctx.fillText(fmtY(STYf),cx,cy-Math.min(W,H)*.02); ctx.font=`500 ${Math.round(Math.min(W,H)*.03)+4}px ${body}`; ctx.fillText(placeName()||'Everywhere',cx,cy+Math.min(W,H)*.09);
  ctx.textBaseline='alphabetic';
  // the movements alive here and now, each a star at its fixed place in its galaxy, the whole scaled toward the vanishing point by its depth
  const items=[], gal={};
  if(STV) STV.forEach((v,id)=>{ const b=STD[id][1]; const z=zOf(STYf<=b?cu:U(b)); if(z>ZMAX) return;
    const s=GS[id]; if(!s) return; const G=s.g, g=growth(id), a=fadeZ(z)*g, k=R0/z*(1.12-.12*g);
    const it={id,v,z,a,g,s,x:cx+(G.x*EX+s.ox)*k,y:cy+(G.y*EY+s.oy)*k,op:a*(v.anc?.3:.25+.75*v.h),pri:(id===selected?20:0)+(v.anc?0:v.h*3)+SC[id][0]*.5-z*.4};
    items.push(it); if(G.m>1) (gal[G.t]=gal[G.t]||[]).push(it); });
  // traditions as galaxies: a tilted disc of light, with dust along its arms
  const dens=Math.min(1,Math.sqrt(55/Math.max(1,items.length)));       // a crowded sky gets fainter halos so it never burns out to white
  ctx.globalCompositeOperation='lighter'; const galLabels=[];
  for(const t in gal){ const ms=gal[t], G=GAL[t]; // the disc is drawn at the depth of the galaxy's nearest members (those still at their peak hold it in the present); members that have ended trail inward from it
    let zmin=1e9; ms.forEach(m=>{ if(m.z<zmin) zmin=m.z; }); let hh=0, ext=0, nn=0; ms.forEach(m=>{ if(m.z>zmin*1.12) return; nn++; hh+=m.op; if(m.s.lr>ext) ext=m.s.lr; });
    const sc=1/zmin, gx=cx+G.x*EX*R0*sc, gy=cy+G.y*EY*R0*sc, full=G.r*R0*sc, inten=Math.min(1,hh/nn*1.4), frac=nn/G.m;
    const rr=full*Math.max(.38,Math.min(1,ext+.15)), col=RCC[G.reg]||regColor(G.reg);
    if(full<3) continue;
    ctx.save(); ctx.translate(gx,gy); ctx.rotate(G.tilt); ctx.scale(1,G.q);
    const gd=.5+.5*dens;   // galaxies no longer sit on top of each other, so their halos need less dimming than the stars do
    ctx.globalAlpha=(.2+.34*inten)*gd; ctx.drawImage(glow(col),-rr*1.9,-rr*1.9,rr*3.8,rr*3.8);
    ctx.globalAlpha=(.06+.14*inten)*gd; ctx.drawImage(glow('#ffffff'),-rr*.42,-rr*.42,rr*.84,rr*.84);
    ctx.scale(full,full); ctx.fillStyle=col;
    if(G.lane&&full>16){ ctx.strokeStyle=col; ctx.lineCap='round';
      ctx.globalAlpha=(.09+.12*inten)*(.25+.75*frac)*gd; ctx.lineWidth=.3; ctx.stroke(G.lane);
      ctx.globalAlpha=(.2+.3*inten)*(.25+.75*frac)*gd; ctx.lineWidth=.075; ctx.stroke(G.lane); }
    if(full>9){ const D=G.dust, px=1/full; ctx.beginPath();
      if(G.type==='spiral') for(let k=0;k<D.length;k++){ const d=D[k]; let f=d.f+tnow*.004*d.s; f-=Math.floor(f); const r=.2+.9*f, a=G.arm(d.j,r)+d.da/(.4+r), s=px*(.9+1.3*d.s*Math.sin(Math.PI*f));
          ctx.rect(Math.cos(a)*r-s/2,Math.sin(a)*r-s/2,s,s); }                                        // motes drift slowly out along the arms
      else for(let k=0;k<D.length;k++){ const d=D[k], r=1.15*Math.pow(d.f,1.3), a=d.a+G.hand*tnow*.03*(1.5-r), s=px*(1.1+.9*d.s)*(1.2-r*.5); ctx.rect(Math.cos(a)*r-s/2,Math.sin(a)*r-s/2,s,s); }
      ctx.globalAlpha=(.22+.4*inten)*(.4+.6*frac)*(.5+.5*dens); ctx.fill(); }
    ctx.restore();
    if(tail>0.01) ray(gx,gy,tail*.6,rr*.5,col,.05+.1*inten);
    if(nn>=3) galLabels.push({t,x:gx,y:gy+rr*G.ey+12,inten,n:nn}); }
  ctx.lineCap='round';
  items.sort((p,q)=>q.z-p.z);
  items.forEach(it=>{ const v=it.v, h=v.anc?.25:v.h, base=RCC[byId[it.id].reg]||regColor(byId[it.id].reg), col=mixC(base,ST_MUTED,v.anc?.8:Math.round(Math.max(0,1-v.h)*.85*5)/5);
    const tw=h>.6?1+.1*Math.sin(tnow*2.3+TRAD01[it.id]*40):1, op=Math.min(1,it.op*tw), rr=it.rr=Math.max(1.1,(1.3+4.6*h)*SK/Math.sqrt(it.z));
    // thickness and brightness carry the strength; the streak is its motion through time
    if(tail>0.01) ray(it.x,it.y,tail*(.55+.6*h),Math.max(1,rr*1.5),col,op*.9);
    ctx.globalAlpha=op*(.3+.65*dens); ctx.drawImage(glow(col),it.x-rr*3.6,it.y-rr*3.6,rr*7.2,rr*7.2);
    ctx.globalCompositeOperation='source-over';
    ctx.globalAlpha=op*.9; ctx.fillStyle=col; ctx.beginPath(); ctx.arc(it.x,it.y,rr*.8,0,TAU); ctx.fill();
    ctx.globalAlpha=op*(.45+.5*h); ctx.drawImage(glow('#ffffff'),it.x-rr*.9,it.y-rr*.9,rr*1.8,rr*1.8);
    ctx.globalCompositeOperation='lighter';
    // birth: a shell of light spreading from a new star
    if(it.g<1){ ctx.globalAlpha=(1-it.g)*.9; ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(it.x,it.y,rr*(1.5+9*it.g),0,TAU); ctx.stroke();
      ctx.globalAlpha=(1-it.g)*.5; ctx.drawImage(glow('#ffffff'),it.x-rr*5,it.y-rr*5,rr*10,rr*10); } });
  ctx.globalCompositeOperation='source-over';
  items.forEach(it=>{ if(it.id===selected){ ctx.globalAlpha=1; ctx.strokeStyle=fg; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(it.x,it.y,it.rr+5,0,TAU); ctx.stroke(); } });
  const boxes=[], named={}; let nlab=0; const ZK=(window.TUNZOOM&&TUNZOOM.k>1.001)?TUNZOOM.k:1, LABMAX=ZK>1?46:Math.round(W*H/17000), fk=W<700?.87:1; TUNHITS=[];
  // magnified: only what is in view competes for names, and far more of them are shown
  const inView=it=>ZK===1||(Math.abs(it.x-TUNZOOM.cx)<W/2/ZK+6&&Math.abs(it.y-TUNZOOM.cy)<H/2/ZK+6);
  items.slice().sort((p,q)=>q.pri-p.pri).forEach(it=>{
    const fs=Math.max(9.5,Math.min(15,15/Math.pow(it.z,.55)))*fk, op=it.a*(it.v.anc?.45:.35+.65*it.v.h);
    TUNHITS.push({id:it.id,x0:it.x-8,x1:it.x+8,y0:it.y-8,y1:it.y+8});
    if((op<.18&&it.id!==selected)||!inView(it)) return; const fz=ZK>1?fs*1.15/ZK:fs, gap=ZK>1?9/ZK+2:9;
    ctx.font=`${it.v.h>=.99&&!it.v.anc?600:400}${it.v.anc?' italic':''} ${fs.toFixed(1)}px ${body}`;
    // the name goes on the outer side of the star's own galaxy, so names fan out from each core
    const w=ctx.measureText(byId[it.id].name).width; let right=it.s.side?it.s.side>0:it.x>=cx-W*.08; if(right&&it.x+11+w>W) right=false; else if(!right&&it.x-11-w<0) right=true;
    const x0=Math.max(2,Math.min(W-w-2,right?it.x+gap:it.x-gap-w)), y0=it.y-fz*.7, bx={x0:x0-1,x1:x0+w+1,y0:y0-.5,y1:y0+fz+.5};
    if(it.id!==selected&&boxes.some(o=>bx.x0<o.x1&&bx.x1>o.x0&&bx.y0<o.y1&&bx.y1>o.y0)) return;
    // a few names per galaxy, so the formations stay readable; the rest show on hover or when selected
    const G=it.s.g, cap=ZK>1?12:W<700?1:G.m>=14?3:2, cnt=named[G.t]||0; if(it.id!==selected&&it.id!==TUNHOVER&&(cnt>=cap||nlab>=LABMAX)) return; named[G.t]=cnt+1; nlab++;
    boxes.push(bx); TUNHITS.push({id:it.id,...bx});
    ctx.globalAlpha=Math.min(1,(op+(it.id===selected||it.id===TUNHOVER?.4:0))*(1-.45*speed)); ctx.fillStyle=fg; ctx.textAlign='left';
    ctx.fillText(byId[it.id].name,x0,it.y+fz*.35); });
  // the brightest galaxies carry their tradition's name, where there is room
  ctx.textAlign='center'; ctx.font=`500 10px ${body}`;
  galLabels.sort((a,b)=>b.inten*b.n-a.inten*a.n).slice(0,W>700?16:8).forEach(g=>{ const nm=TRADN[g.t]; if(!nm) return; const txt=nm.toUpperCase(), w=ctx.measureText(txt).width+txt.length*.8, bx={x0:g.x-w/2-2,x1:g.x+w/2+2,y0:g.y-9,y1:g.y+3};
    if(bx.x0<4||bx.x1>W-4||bx.y1>H-4||boxes.some(o=>bx.x0<o.x1&&bx.x1>o.x0&&bx.y0<o.y1&&bx.y1>o.y0)) return; boxes.push(bx);
    ctx.globalAlpha=(.3+.3*g.inten)*(1-.6*speed); ctx.fillStyle=ring; try{ ctx.letterSpacing='0.8px'; }catch(e){} ctx.fillText(txt,g.x,g.y); try{ ctx.letterSpacing='0px'; }catch(e){} });
  ctx.globalAlpha=1; ctx.textAlign='left';
};
