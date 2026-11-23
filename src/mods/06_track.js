/* Usage log: which views are opened, which place, time and genre are chosen, what is copied.
   Active testers: rows go to the table events under their account (see 10_people.js).
   Everyone else: rows go to the bounded table anon_events with no identifier beyond a random id for
   this visit. Nothing is sent when the browser asks not to be tracked. Batched, capped per visit,
   and never allowed to slow or break the page. */
const C=window.WMCFG;
const SES=Math.random().toString(36).slice(2,12), MAX=150;
let Q=[], n=0;
const quiet=()=>{ try{ return navigator.globalPrivacyControl===true||navigator.doNotTrack==='1'; }catch(e){ return false; } };
const tester=()=>{ const a=window.ACCOUNT; return !!(a&&a.isActive&&a.isActive()&&a.client()); };
function track(action,ref){ if(!C||!C.on||n>=MAX) return; if(!tester()&&quiet()) return; n++; Q.push({session:SES,action:String(action).slice(0,24),ref:ref||null}); }
async function flush(){ if(!Q.length) return; const batch=Q; Q=[];
  try{ if(tester()){ await window.ACCOUNT.client().from('events').insert(batch); return; }
    if(quiet()) return;
    await fetch(C.url+'/rest/v1/anon_events',{method:'POST',keepalive:true,headers:{'apikey':C.key,'Authorization':'Bearer '+C.key,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(batch)});
  }catch(e){} }
setInterval(flush,20000);
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden') flush(); });
window.TRACK=track; window.TRACKFLUSH=flush;

/* what gets recorded */
const pk=p=>{ if(!p) return null; if(p.k==='cty') return 'cty:'+p.iso; if(p.k==='reg') return 'reg:'+p.reg; if(p.k==='city'){ const c=CITIES[p.i]; return c?'city:'+c.iso2+':'+c.name:null; } if(p.k==='multi') return 'multi:'+(p.items||[]).map(pk).join('+').slice(0,200); return null; };
const gk=g=>!g?null:g.k==='multi'?'multi:'+(g.items||[]).map(x=>x.k+':'+x.id).join('+').slice(0,200):g.k+':'+g.id;
window.PLKEY=pk;
track('session',{w:innerWidth,h:innerHeight,dark:matchMedia('(prefers-color-scheme: dark)').matches,lang:navigator.language,ref:(document.referrer?new URL(document.referrer).hostname:'')||null,v:curView()});
const showView0=showView; showView=function(v){ const r=showView0.apply(this,arguments); try{ track('view',{v}); }catch(e){} return r; };
/* filters: one row once the choice has settled, not one per drag step */
let ft=null, last='';
FHOOKS.push(()=>{ clearTimeout(ft); ft=setTimeout(()=>{ try{ const [a,b]=stRange(), ref={pl:pk(STP),y0:Math.round(a),y1:Math.round(b),g:gk(FG)}, s=JSON.stringify(ref); if(s!==last&&(ref.pl||ref.g||last)){ last=s; track('filter',ref); } }catch(e){} },2500); });
