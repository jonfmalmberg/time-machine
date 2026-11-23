/* Satellite view for the world map.
   window.EARTHTEX : equirectangular (plate carree, 2:1) Earth texture, resolved lazily in this order:
     (a) same-origin file earth.jpg next to the page, (b) static site only: NASA Blue Marble from jsDelivr (CORS),
     (c) procedural stand-in painted from the country polygons.
   window.SATMAP   : {on, set(on), toggle(), stats}
   mapDraw is wrapped by assignment: the original still draws every overlay and fills MAPHITS; while it runs, the
   canvas context is given a colour remap (sea/land become transparent, borders light, labels haloed) and its first
   full-canvas fillRect is replaced by the cached imagery. */
const SAT_FILE='earth.jpg';
const SAT_CDN='https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/earth-blue-marble.jpg';
const LABEL_NASA='Imagery: NASA Blue Marble', LABEL_PROC='Stylised terrain (no satellite image available here)';
const mk=(w,h)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; };
const sstep=t=>{ t=t<0?0:t>1?1:t; return t*t*(3-2*t); };
const lowMem=()=>{ try{ return (navigator.deviceMemory&&navigator.deviceMemory<=4)||matchMedia('(pointer:coarse)').matches; }catch(e){ return false; } };

/* ---------- texture source ---------- */
const T=window.EARTHTEX={state:'idle', source:null, label:'', canvas:null, w:0, h:0, lev:[], miller:null, id:0, file:SAT_FILE, cdn:SAT_CDN,
  // adopt any drawable (image or canvas) as the texture; throws if its pixels cannot be read (tainted)
  use(img,source,label){
    const iw=img.naturalWidth||img.width, ih=img.naturalHeight||img.height; if(!iw||!ih) throw new Error('empty image');
    const r=iw/ih; if(r<1.9||r>2.1) throw new Error('not a 2:1 equirectangular image ('+iw+'x'+ih+')');
    const w=Math.min(iw,lowMem()?2048:4096), h=Math.round(w/2), c=mk(w,h), g=c.getContext('2d',{willReadFrequently:true});
    g.imageSmoothingQuality='high'; g.drawImage(img,0,0,w,h);
    const d=g.getImageData(0,0,w,h).data;
    T.canvas=c; T.w=w; T.h=h; T.lev=[{w,h,d,c}]; T.miller=null; T.source=source; T.label=label; T.state='ready'; T.id++;
  },
  level(i){ // mip level i (each half the size of the one before), built on demand
    while(T.lev.length<=i){ const p=T.lev[T.lev.length-1], w=Math.max(2,p.w>>1), h=Math.max(1,p.h>>1), c=mk(w,h), g=c.getContext('2d',{willReadFrequently:true});
      g.imageSmoothingQuality='high'; g.drawImage(p.c,0,0,w,h); T.lev.push({w,h,c,d:g.getImageData(0,0,w,h).data}); }
    return T.lev[i]; },
  load(){
    if(T.state!=='idle') return; T.state='loading';
    const tryImg=(url,cors,source,ms)=>new Promise((ok,no)=>{ const im=new Image(); let done=false;
      const fail=e=>{ if(done) return; done=true; no(e||new Error('load failed')); };
      const tm=setTimeout(()=>fail(new Error('timeout')),ms);
      if(cors) im.crossOrigin='anonymous';
      im.onload=()=>{ if(done) return; clearTimeout(tm); done=true; try{ T.use(im,source,LABEL_NASA); ok(); }catch(e){ no(e); } };
      im.onerror=()=>{ clearTimeout(tm); fail(new Error('not found')); };
      im.src=url; });
    tryImg(SAT_FILE,false,'file',9000)
      .catch(()=>{ if(!STATIC) throw 0; return tryImg(SAT_CDN,true,'nasa-cdn',15000); })
      .catch(()=>{ T.state='needland'; })
      .then(()=>{ satSync(); requestMapDraw(); });
  }
};

/* ---------- (c) procedural stand-in ---------- */
function fbmField(W,H,seed){
  let s=seed>>>0; const rnd=()=>{ s=(s+0x6D2B79F5)|0; let t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; };
  const F=new Float32Array(W*H); let amp=.5, tot=0;
  for(let o=0;o<6;o++){ const gw=6<<o, gh=(3<<o)+1, L=new Float32Array(gw*(gh+1)); for(let i=0;i<L.length;i++) L[i]=rnd();
    const X0=new Int32Array(W), X1=new Int32Array(W), TX=new Float32Array(W);
    for(let x=0;x<W;x++){ const fx=x/W*gw, i=Math.floor(fx); X0[x]=i%gw; X1[x]=(i+1)%gw; TX[x]=sstep(fx-i); }   // periodic in longitude
    for(let y=0;y<H;y++){ const fy=y/H*(gh-1), j=Math.floor(fy), ty=sstep(fy-j), r0=j*gw, r1=(j+1)*gw, row=y*W;
      for(let x=0;x<W;x++){ const a=L[r0+X0[x]], b=L[r0+X1[x]], c=L[r1+X0[x]], d=L[r1+X1[x]], tx=TX[x]; const top=a+(b-a)*tx; F[row+x]+=amp*(top+((c+(d-c)*tx)-top)*ty); } }
    tot+=amp; amp*=.55; }
  for(let i=0;i<F.length;i++) F[i]/=tot;
  return F;
}
// dry regions: [lon0, lon1, lat0, lat1, soft edge (deg), strength, colour]
const DRY=[[-17,36,16.5,31.5,4,1,[212,184,136]],[35,59,14,33,3,1,[208,176,128]],[50,73,24,37,3,.8,[188,160,120]],[50,80,37,47,4,.7,[176,156,112]],
  [78,113,36,46,3.5,.85,[190,164,122]],[79,102,28.5,36,2.5,.65,[150,136,112]],[114,147,-31,-18.5,4,.9,[186,120,78]],[12,26,-30,-18,3,.7,[190,154,106]],
  [-72.5,-67,-29,-15,1.5,.9,[190,160,120]],[-72,-65,-51,-37,2,.5,[150,138,100]],[-118,-101,24,40,3,.7,[188,160,118]],[39,52,2,13,2.5,.6,[190,160,110]]];
// land colour by absolute latitude where it is not dry: tropical forest, savanna, temperate, boreal, tundra, ice
const BIOME=[[0,30,74,34],[9,34,80,36],[16,76,102,48],[24,90,106,56],[32,74,100,50],[42,58,94,46],[52,44,76,42],[60,46,70,44],[66,96,98,74],[72,150,150,140],[77,232,236,240],[90,246,248,250]];
function buildProcedural(){
  const W=2048, H=1024, mc=mk(W,H), g=mc.getContext('2d',{willReadFrequently:true});
  g.fillStyle='#000'; g.fillRect(0,0,W,H); g.fillStyle='#fff'; g.strokeStyle='#fff'; g.lineWidth=1;
  COUNTRIES.forEach(c=>{ const offs=[0]; if(c.bb[2]>180) offs.push(-W); if(c.bb[0]<-180) offs.push(W);
    offs.forEach(off=>{ g.beginPath(); c.polys.forEach(p=>p.forEach(r=>{ r.forEach(([lo,la],i)=>{ const x=(lo+180)/360*W+off, y=(90-la)/180*H; if(i) g.lineTo(x,y); else g.moveTo(x,y); }); g.closePath(); })); g.fill('evenodd'); g.stroke(); }); });
  const blur=n=>{ let c=mc; for(let i=0;i<n;i++){ const d=mk(Math.max(1,c.width>>1),Math.max(1,c.height>>1)), q=d.getContext('2d'); q.imageSmoothingQuality='high'; q.drawImage(c,0,0,d.width,d.height); c=d; }
    const o=mk(W,H), q=o.getContext('2d',{willReadFrequently:true}); q.imageSmoothingQuality='high'; q.drawImage(c,0,0,W,H); return q.getImageData(0,0,W,H).data; };
  const M=g.getImageData(0,0,W,H).data, B2=blur(2), B8=blur(4), B64=blur(6), F=fbmField(W,H,20261116);
  const out=g.createImageData(W,H), O=out.data;
  const gauss=x=>Math.exp(-x*x), wrapd=d=>((d+540)%360)-180, NZ=v=>{ v=(v-.5)*2.7+.5; return v<0?0:v>1?1:v; };
  for(let y=0;y<H;y++){ const lat=90-(y+.5)/H*180, row=y*W;
    for(let x=0;x<W;x++){ const i=row+x, p=i*4, lon=(x+.5)/W*360-180;
      const n=NZ(F[i]), n2=NZ(F[row+((x+683)%W)]), n3=NZ(F[(H-1-y)*W+((x+1201)%W)]);          // three decorrelated reads of one field
      const relief=(F[i]-F[(y>1?i-2*W:i)-(x>1?2:0)])*4.5;
      const land=sstep((M[p]*.6+B2[p]*.4)/255*1.6-.3), near=B8[p]/255, broad=B64[p]/255;
      // ocean: deep navy far from land, lighter on the shelves
      const sh=sstep(near*1.5-.08)*.8, mid=Math.pow(broad,.8), cold=sstep((Math.abs(lat)-45)/30);
      let r=7+16*mid+34*sh, gg=22+34*mid+62*sh-8*cold, b=56+38*mid+52*sh-10*cold; const on=.92+.16*n+relief*.25; r*=on; gg*=on; b*=on;
      // sea ice: Arctic pack and a ragged fringe round Antarctica
      const antC=-68-5*gauss(wrapd(lon+40)/25)-6*gauss(wrapd(lon-180)/25)+5*gauss((lon+62)/5)+(n2-.5)*5;
      const ice=Math.max(sstep((lat-83-(n2-.5)*10)/2.5)*.9, sstep((antC+5-lat)/6)*.55);
      if(ice>0){ r+=(232-r)*ice; gg+=(238-gg)*ice; b+=(244-b)*ice; }
      let L=land; const ant=sstep((antC-lat)/1.2); if(ant>L) L=ant;
      if(L>0){
        let lr,lg,lb;
        if(ant>=land&&ant>0){ const k=.94+.1*n+relief*.5; lr=238*k; lg=242*k; lb=247*k; }
        else {
          const al=Math.min(89.9,Math.max(0,Math.abs(lat)+(n3-.5)*12)); let k=0; while(al>=BIOME[k+1][0]) k++;
          const A=BIOME[k], Bm=BIOME[k+1], t=(al-A[0])/(Bm[0]-A[0]); lr=A[1]+(Bm[1]-A[1])*t; lg=A[2]+(Bm[2]-A[2])*t; lb=A[3]+(Bm[3]-A[3])*t;
          let dry=0, dc=null;
          // each dry region is a soft rounded blob whose outline is pushed around by the noise, so no straight edges
          for(const d of DRY){ const rx=(d[1]-d[0])/2, ry=(d[3]-d[2])/2, wob=Math.min(rx,ry,7);
            const dx=Math.abs(lon+(n2-.5)*wob*1.6-(d[0]+d[1])/2)/rx, dy=Math.abs(lat+(n-.5)*wob*1.6-(d[2]+d[3])/2)/ry; if(dx>1.5||dy>1.5) continue;
            const w=sstep((1.25-Math.cbrt(dx*dx*dx+dy*dy*dy))/.42)*d[5]; if(w>dry){ dry=w; dc=d[6]; } }
          if(dry>0){ const a=sstep((dry+(n3-.5)*.3-.2)/.55), v=.88+.24*n3; lr+=(dc[0]*v-lr)*a; lg+=(dc[1]*v-lg)*a; lb+=(dc[2]*v-lb)*a; }
          // Greenland ice cap, away from its coast
          if(lon>-70&&lon<-10&&lat>60){ const a=sstep((lon+68)/8)*sstep((-12-lon)/6)*sstep((lat-61)/3)*sstep((near-.72)/.2+(n2-.5)*.4); lr+=(240-lr)*a; lg+=(243-lg)*a; lb+=(247-lb)*a; }
          const k2=.8+.4*n+relief; lr*=k2; lg*=k2; lb*=k2;
        }
        r+=(lr-r)*L; gg+=(lg-gg)*L; b+=(lb-b)*L;
      }
      O[p]=r; O[p+1]=gg; O[p+2]=b; O[p+3]=255; } }
  g.putImageData(out,0,0);
  T.use(mc,'procedural',LABEL_PROC);
}

/* ---------- rendering the background ---------- */
const YMAX=MILLER(89);
function millerTex(){ // the texture re-projected once to Miller, so the flat map is a single scaled blit
  if(T.miller) return T.miller;
  const L=T.lev[0], w=L.w, h=Math.round(w*2*YMAX/(2*Math.PI)), c=mk(w,h), g=c.getContext('2d'), im=g.createImageData(w,h), O=im.data, S=L.d, w4=w*4;
  for(let j=0;j<h;j++){ const lat=IMILLER(YMAX-(j+.5)/h*2*YMAX); let v=(90-lat)/180*L.h-.5; if(v<0) v=0; if(v>L.h-1) v=L.h-1;
    const i0=Math.floor(v), i1=Math.min(L.h-1,i0+1), f=v-i0, a=i0*w4, b=i1*w4, o=j*w4;
    for(let x=0;x<w4;x++) O[o+x]=S[a+x]+(S[b+x]-S[a+x])*f; }
  g.putImageData(im,0,0); return T.miller=c;
}
const SPACE='#04070d';
function renderFlat(bg,dpr){
  const W=bg.width, H=bg.height, g=bg.getContext('2d'), m=millerTex(), s=base()*MV.k*dpr;
  g.setTransform(1,0,0,1,0,0); g.fillStyle=SPACE; g.fillRect(0,0,W,H);
  const x0=W/2+(-Math.PI-MV.cx)*s, wpx=2*Math.PI*s, y0=H/2-(YMAX-MV.cy)*s, hpx=2*YMAX*s;
  const u0=Math.max(0,(0-x0)/wpx), u1=Math.min(1,(W-x0)/wpx), v0=Math.max(0,(0-y0)/hpx), v1=Math.min(1,(H-y0)/hpx); if(u1<=u0||v1<=v0) return;
  g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high';
  g.drawImage(m,u0*m.width,v0*m.height,(u1-u0)*m.width,(v1-v0)*m.height,x0+u0*wpx,y0+v0*hpx,(u1-u0)*wpx,(v1-v0)*hpx);
}
function renderGlobe(bg,dpr,budget){
  const W=bg.width, H=bg.height, g=bg.getContext('2d'), R=gR()*dpr, cx=W/2, cy=H/2;
  g.setTransform(1,0,0,1,0,0); g.fillStyle=SPACE; g.fillRect(0,0,W,H);
  const glow=g.createRadialGradient(cx,cy,R*.985,cx,cy,R*1.075); glow.addColorStop(0,'rgba(120,180,255,.75)'); glow.addColorStop(.35,'rgba(90,150,255,.28)'); glow.addColorStop(1,'rgba(60,120,255,0)');
  g.fillStyle=glow; g.beginPath(); g.arc(cx,cy,R*1.075,0,Math.PI*2); g.fill();
  const bx0=Math.max(0,Math.floor(cx-R-1)), bx1=Math.min(W,Math.ceil(cx+R+1)), by0=Math.max(0,Math.floor(cy-R-1)), by1=Math.min(H,Math.ceil(cy+R+1));
  const bw=bx1-bx0, bh=by1-by0; if(bw<=0||bh<=0) return 1;
  const scale=Math.max(1,Math.sqrt(bw*bh/budget)), sw=Math.max(1,Math.ceil(bw/scale)), sh=Math.max(1,Math.ceil(bh/scale));
  const lv=Math.max(0,Math.min(5,Math.round(Math.log2(Math.max(1,(T.w/(2*Math.PI))/(R/scale)))))), L=T.level(lv), tw=L.w, th=L.h, S=L.d;
  const tmp=renderGlobe.tmp&&renderGlobe.tmp.width===sw&&renderGlobe.tmp.height===sh?renderGlobe.tmp:(renderGlobe.tmp=mk(sw,sh)), tg=tmp.getContext('2d');
  const im=tg.createImageData(sw,sh), O=im.data;
  const l0=MV.glon*toRad, sp=Math.sin(MV.glat*toRad), cp=Math.cos(MV.glat*toRad), TAU=2*Math.PI, edge=R/scale;
  for(let j=0;j<sh;j++){ const py=(cy-(by0+(j+.5)*scale))/R, py2=py*py; if(py2>1.02) continue;
    for(let i=0;i<sw;i++){ const px=((bx0+(i+.5)*scale)-cx)/R, r2=px*px+py2; let cov=1, z;
      if(r2>=1){ const rho=Math.sqrt(r2); cov=(1-rho)*edge+.5; if(cov<=0) continue; z=0; } else { z=Math.sqrt(1-r2); const c2=(1-Math.sqrt(r2))*edge+.5; if(c2<1) cov=c2; }
      const k=r2>1?1/Math.sqrt(r2):1, qx=px*k, qy=py*k;
      const gx=z*cp-qy*sp, gz=z*sp+qy*cp; let lon=l0+Math.atan2(qx,gx); const lat=Math.asin(gz>1?1:gz<-1?-1:gz);
      let u=(lon/TAU+.5)*tw-.5; u-=Math.floor(u/tw)*tw; let v=(.5-lat/Math.PI)*th-.5; if(v<0) v=0; else if(v>th-1) v=th-1;
      const u0=Math.floor(u), fu=u-u0, v0=Math.floor(v), fv=v-v0, ua=(u0%tw)*4, ub=((u0+1)%tw)*4, ra=v0*tw*4, rb=Math.min(th-1,v0+1)*tw*4;
      const a=ra+ua, b=ra+ub, c=rb+ua, d=rb+ub, w00=(1-fu)*(1-fv), w10=fu*(1-fv), w01=(1-fu)*fv, w11=fu*fv;
      // limb darkening, then a thin bluish haze towards the rim
      const shade=.36+.64*Math.sqrt(z), e=1-z, e2=e*e, haze=e2*e2*e*.62, hk=1-haze, o=(j*sw+i)*4;
      O[o]=(S[a]*w00+S[b]*w10+S[c]*w01+S[d]*w11)*shade*hk+150*haze;
      O[o+1]=(S[a+1]*w00+S[b+1]*w10+S[c+1]*w01+S[d+1]*w11)*shade*hk+196*haze;
      O[o+2]=(S[a+2]*w00+S[b+2]*w10+S[c+2]*w01+S[d+2]*w11)*shade*hk+255*haze;
      O[o+3]=cov>=1?255:cov*255; } }
  tg.putImageData(im,0,0);
  g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high'; g.drawImage(tmp,bx0,by0,sw*scale,sh*scale);
  return scale;
}
const S={on:false, bg:null, key:null, q:'full', wantFull:false, timer:0, stats:{flat:0,low:0,full:0,blit:0,ms:0}};
const LOW_BUDGET=110000, FULL_BUDGET=1800000;
function ensureBg(cv){
  const W=cv.width, H=cv.height, dpr=W/MW, flat=MV.proj==='flat';
  if(!S.bg||S.bg.width!==W||S.bg.height!==H){ S.bg=mk(W,H); S.key=null; }
  const key=[T.id,W,H,MV.proj].concat(flat?[MV.cx,MV.cy,MV.k]:[MV.glon,MV.glat,MV.gk]).join('|');
  if(key===S.key&&!(S.q==='low'&&S.wantFull)) return;
  const t0=performance.now();
  if(flat){ renderFlat(S.bg,dpr); S.q='full'; S.stats.flat++; }
  else {
    const full=S.key===null||(key===S.key&&S.wantFull);          // first frame and settled frames at full resolution, moving frames reduced
    const sc=renderGlobe(S.bg,dpr,full?FULL_BUDGET:LOW_BUDGET); S.q=full||sc<=1.01?'full':'low'; S.stats[S.q]++;
    if(S.q==='low'){ clearTimeout(S.timer); S.timer=setTimeout(()=>{ S.wantFull=true; requestMapDraw(); },170); }
  }
  S.wantFull=false; S.key=key; S.stats.ms=performance.now()-t0;
}

/* ---------- overlay restyle: a colour remap on the context while the original mapDraw runs ---------- */
const CP=CanvasRenderingContext2D.prototype, dF=Object.getOwnPropertyDescriptor(CP,'fillStyle'), dS=Object.getOwnPropertyDescriptor(CP,'strokeStyle');
const CLEAR='rgba(0,0,0,0)', INK='#ffffff', DARK='#0a0f18', TINT='#ffd24a', HALO='rgba(4,8,14,.82)';
function patch(ctx,cv){
  const v=n=>css(n).toLowerCase(), sea=v('--sea'), land=v('--land'), coast=v('--coast'), grat=v('--grat'), fg=v('--fg'), panel=v('--panel'), accent=v('--accent'), muted=v('--muted');
  const fill={}, stroke={};
  fill[fg]=INK; fill[panel]=DARK; fill[accent]=TINT; fill[muted]='rgba(255,255,255,.85)'; fill[sea]=CLEAR; fill[land]=CLEAR;
  fill[mixC(land,fg,.1).toLowerCase()]='rgba(255,255,255,.17)'; fill[mixC(land,accent,.42).toLowerCase()]='rgba(255,210,74,.34)'; fill[mixC(land,accent,.22).toLowerCase()]='rgba(255,210,74,.2)';
  stroke[fg]=INK; stroke[panel]=DARK; stroke[accent]=TINT; stroke[coast]='rgba(255,255,255,.5)'; stroke[grat]='rgba(255,255,255,.13)';
  let grads=1, first=true;
  Object.defineProperty(ctx,'fillStyle',{configurable:true,get(){ return dF.get.call(this); },
    set(x){ if(typeof x==='string'){ const m=fill[x.trim().toLowerCase()]; dF.set.call(this,m||x); } else if(grads>0){ grads--; dF.set.call(this,CLEAR); } else dF.set.call(this,x); }});
  Object.defineProperty(ctx,'strokeStyle',{configurable:true,get(){ return dS.get.call(this); },
    set(x){ if(typeof x==='string'){ const m=stroke[x.trim().toLowerCase()]; dS.set.call(this,m||x); } else dS.set.call(this,x); }});
  ctx.fillRect=function(x,y,w,h){ if(first&&x<=0&&y<=0&&w>=MW&&h>=MH){ first=false; ensureBg(cv); S.stats.blit++; CP.drawImage.call(this,S.bg,0,0,MW,MH); return; } CP.fillRect.call(this,x,y,w,h); };
  ctx.fillText=function(t,x,y){ const ss=dS.get.call(this), lw=this.lineWidth, lj=this.lineJoin; dS.set.call(this,HALO); this.lineWidth=3; this.lineJoin='round'; CP.strokeText.call(this,t,x,y);
    dS.set.call(this,ss); this.lineWidth=lw; this.lineJoin=lj; CP.fillText.call(this,t,x,y); };
}
function unpatch(ctx){ delete ctx.fillStyle; delete ctx.strokeStyle; delete ctx.fillRect; delete ctx.fillText; }

const origMapDraw=mapDraw;
mapDraw=function(now){
  if(!S.on) return origMapDraw(now);
  const cv=mcv(); if(!cv||document.getElementById('view-map').hidden||!MW) return origMapDraw(now);
  if(T.state!=='ready'){ origMapDraw(now);                       // plain map until the imagery is ready (this also decodes COUNTRIES)
    if(T.state==='idle') T.load();
    else if(T.state==='needland'&&COUNTRIES){ try{ buildProcedural(); }catch(e){ console.warn('satellite: stand-in texture failed',e); T.state='failed'; } satSync(); requestMapDraw(); }
    return; }
  const ctx=cv.getContext('2d'); patch(ctx,cv);
  try{ origMapDraw(now); } finally{ unpatch(ctx); }
};

/* ---------- button, caption, persistence ---------- */
let btn=null, cap=null;
function satSync(){
  if(btn){ btn.setAttribute('aria-pressed',String(S.on)); btn.setAttribute('aria-busy',String(S.on&&T.state==='loading')); }
  const box=document.getElementById('map'); if(box) box.classList.toggle('sat',S.on&&T.state==='ready');
  if(cap){ const txt=!S.on?'':T.state==='ready'?T.label:(T.state==='failed'?'':'Loading imagery…'); cap.textContent=txt; cap.hidden=!txt; }
}
function satSet(on){ S.on=!!on; try{ localStorage.setItem('wmft-sat',S.on?'on':'off'); }catch(e){} S.key=null; satSync(); requestMapDraw(); }
const mb=document.querySelector('.mapbtns'), mapBox=document.getElementById('map');
if(mb&&!document.getElementById('msat')){
  btn=document.createElement('button'); btn.id='msat'; btn.type='button'; btn.textContent='Satellite'; btn.title='Show satellite imagery under the map'; btn.onclick=()=>satSet(!S.on); mb.appendChild(btn);
  cap=document.createElement('div'); cap.id='satcap'; cap.className='satcap'; cap.hidden=true; mapBox.appendChild(cap);
}
/* on unless this visitor turned it off */
try{ S.on=localStorage.getItem('wmft-sat')!=='off'; }catch(e){ S.on=true; }
window.SATMAP={ get on(){ return S.on; }, set:satSet, toggle(){ satSet(!S.on); }, stats:S.stats, get quality(){ return S.q; }, get bg(){ return S.bg; } };
satSync(); if(S.on) requestMapDraw();
