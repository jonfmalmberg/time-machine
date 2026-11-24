/* What a link shows, in words: "Canada · 1980–2020 · Country". One function, used by the page (tab title, share sheet)
   and by the Worker (the title a chat app shows in a link preview). q = the link's parameters (see src/mods/45_links.js);
   N = name look-ups {cty,reg,mov,band,trad: id => name or undefined, t1: the present year}. Unknown ids are left out. */
export function linkTitle(q, N){
  const yr=y=>{ y=Math.round(+y); return y<0?(-y)+' BCE':String(y); };
  const list=a=>a.length>3?a.slice(0,2).join(', ')+' +'+(a.length-2)+' more':a.join(', ');
  const many=(v,one)=>{ if(!v) return []; const parts=String(v).indexOf('multi:')===0?String(v).slice(6).split('+'):[String(v)]; const out=[]; parts.forEach(t=>{ const n=one(t); if(n&&out.indexOf(n)<0) out.push(n); }); return out; };
  const place=t=>{ const a=t.indexOf(':'); if(a<0) return ''; const k=t.slice(0,a), x=t.slice(a+1);
    if(k==='cty') return N.cty(x)||''; if(k==='reg') return N.reg(x)||''; if(k==='city'){ const b=x.indexOf(':'); return b<0?'':x.slice(b+1); } return ''; };
  const genre=t=>{ const a=t.indexOf(':'); if(a<0) return ''; const k=t.slice(0,a), x=t.slice(a+1); return k==='mov'?N.mov(x)||'':k==='band'?N.band(x)||'':k==='trad'?N.trad(x)||'':''; };
  const out=[], t1=N.t1||2026;
  const own=q.pl&&q.pl!=='1'?q.pl:q.sel, ownName=own?N.mov(own):'';
  if(ownName) out.push(ownName);
  const P=many(q.p,place); if(P.length) out.push(list(P));
  const hasY=q.y!=null&&q.y!==''&&/^-?\d{1,5}$/.test(String(q.y)), y=hasY?+q.y:t1, s=q.s==null?'':String(q.s);
  let time='';
  if(s.indexOf('from:')===0&&/^-?\d{1,5}$/.test(s.slice(5))){ const a=+s.slice(5); time=a<y?yr(a)+'–'+yr(y):yr(y); }
  else if(/^\d{1,3}$/.test(s)){ const n=+s; time=n===0?yr(y):yr(y-n)+'–'+yr(Math.min(t1,y+n)); }
  else if(hasY&&y!==t1) time='up to '+yr(y);
  if(time) out.push(time);
  const G=many(q.g,genre).filter(n=>n!==ownName); if(G.length) out.push(list(G));
  if(q.pl&&out.length) out.push('Playlist');
  return out.join(' · ');
}
