/* Requests: "test this playlist with a synthetic listener" and "research this", for a place and time or for a genre.
   The playlist panel shows two rows, Research and Synthetic listener test, in both of its modes. Each row says
   whether the work has been done (research: from the data on the page; listener tests: data/tests.json), whether
   this browser has asked for it, or offers a Request button. Only the owner is offered a rerun of finished work.
   The hosted site cannot run either on the spot, so a request is logged in the database (table
   requests, see db/005_requests.sql), the person is told it was received, and the owner sees the list
   on the Admin page. Works with or without an account. This browser remembers what it has asked for. */
const C=window.WMCFG; if(!C||!C.on) return;
const LSK='wmft-requests'; let SENT={}; try{ SENT=JSON.parse(localStorage.getItem(LSK)||'{}')||{}; }catch(e){}
const keep=()=>{ try{ const ks=Object.keys(SENT); if(ks.length>200) ks.slice(0,ks.length-200).forEach(k=>delete SENT[k]); localStorage.setItem(LSK,JSON.stringify(SENT)); }catch(e){} };
async function send(kind,key,ref){
  const a=window.ACCOUNT, cl=a&&a.user&&a.user()&&a.client();
  try{ let status;
    if(cl){ const {data,error}=await cl.rpc('request_add',{req_kind:kind,req_key:key,req_ref:ref}); if(error) throw error; status=data; }
    else{ const r=await fetch(C.url+'/rest/v1/rpc/request_add',{method:'POST',headers:{'apikey':C.key,'Authorization':'Bearer '+C.key,'Content-Type':'application/json'},body:JSON.stringify({req_kind:kind,req_key:key,req_ref:ref})});
      if(!r.ok){ let m=''; try{ m=(await r.json()).message||''; }catch(e){} throw new Error(m||'The request could not be sent.'); } status=await r.json(); }
    SENT[kind+'|'+key]={at:Date.now(),status}; keep(); try{ if(window.TRACK) window.TRACK('request',{kind,key}); }catch(e){}
    return {ok:true,status};
  }catch(e){ return {ok:false,msg:(e&&e.message)||'The request could not be sent.'}; }
}
/* one ask that covers several pieces of work (research for a country over several decades): each piece gets an equal share of one request */
async function sendMany(kind,items){
  const a=window.ACCOUNT, cl=a&&a.user&&a.user()&&a.client(), body={req_kind:kind,req_items:items};
  try{ let out;
    if(cl){ const {data,error}=await cl.rpc('request_many',body); if(error) throw error; out=data; }
    else{ const r=await fetch(C.url+'/rest/v1/rpc/request_many',{method:'POST',headers:{'apikey':C.key,'Authorization':'Bearer '+C.key,'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!r.ok){ let m=''; try{ m=(await r.json()).message||''; }catch(e){} throw new Error(m||'The request could not be sent.'); } out=await r.json(); }
    items.forEach(it=>{ SENT[kind+'|'+it.key]={at:Date.now(),status:(out&&out[it.key])||'open'}; }); keep(); try{ if(window.TRACK) window.TRACK('request',{kind,keys:items.map(it=>it.key)}); }catch(e){}
    return {ok:true};
  }catch(e){ return {ok:false,msg:(e&&e.message)||'The request could not be sent.'}; }
}
window.REQUESTS={send,sent:(kind,key)=>SENT[kind+'|'+key]||null};

const TESTS=DATA.tests||[], $=k=>document.getElementById(k);
const hash=s=>{ let h=5381; for(let i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))>>>0; return h.toString(36); };
const day=d=>{ try{ return new Date(d+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }catch(e){ return d; } };
const tested=t=>`Run ${day(t.date)}: scored ${t.scores.join(', ')} out of 10${t.result==='below'?', below the bar':''}${t.note?' ('+t.note+')':''}.`;
const owner=()=>{ try{ return !!(window.ACCOUNT&&window.ACCOUNT.isOwner&&window.ACCOUNT.isOwner()); }catch(e){ return false; } };
const LT_='Synthetic listener test', RT_='Research';

/* Research for a place and time is done one country and one decade at a time, from the 1940s on. So the Research row
   speaks in those pieces: the decades the time filter covers, which are researched, which this browser has asked for,
   and a button for the rest. A listener test is different: it tests exactly the filters and prompt on screen. */
const decs=iso=>{ const [y0,y1]=stRange(), a=Math.max(1940,Math.floor(y0/10)*10), b=Math.min(2020,Math.floor(y1/10)*10), L=YEARL[iso]||{}, ys=Object.keys(L), out=[];
  for(let d=a;d<=b;d+=10) out.push({dec:d,has:ys.some(y=>decadeKey(+y)===String(d))}); return out; };
const dl=ds=>ds.length>2&&ds[ds.length-1]-ds[0]===10*(ds.length-1)?ds[0]+'s to '+ds[ds.length-1]+'s':ds.map(d=>d+'s').join(', ');
function momentRows(){ const place=placeName()||'the world', pl=STP&&window.PLKEY?window.PLKEY(STP):'world', iso=placeIso(), cn=iso?isoName(iso):place, [y0,y1]=stRange(), a=Math.round(y0), b=Math.round(y1);
  let res; const D=iso?decs(iso):[], ref=(d,k)=>({iso,decade:d,kind:k,label:cn+', '+d+'s'});
  if(!iso) res={none:true,text:'Song research is done for one country, decade by decade. Choose a country to request it.'};
  else if(!D.length) res={none:true,text:`Song research for ${cn} covers the 1940s onward.`};
  else if(D.length===1){ const d=D[0].dec, r=a===b?researchState():null;
    res=r&&r.state==='sparse'?{text:`${cn}, ${d}s. Thinly sourced: only ${r.n} home-grown song${r.n===1?'':'s'} with evidence for ${STY}; the rest comes from the decade list.`,btn:'Request more',key:iso+'_'+d+'_sparse',ref:Object.assign(ref(d,'sparse'),{year:STY})}
      :D[0].has?{done:true,text:`Year-by-year hit lists for ${cn}, ${d}s.`,key:iso+'_'+d+'_rerun',ref:ref(d,'rerun')}
      :{text:`No year-by-year research for ${cn} in the ${d}s yet.`,key:iso+'_'+d+'_new',ref:ref(d,'new')}; }
  else{ const st=d=>d.has?'done':((SENT['research|'+iso+'_'+d.dec+'_new']||{}).status==='done'?'done':SENT['research|'+iso+'_'+d.dec+'_new']?'asked':'todo');
    const done=D.filter(d=>st(d)==='done'), asked=D.filter(d=>st(d)==='asked'), todo=D.filter(d=>st(d)==='todo'), n=todo.length;
    res={group:true,n,asked:asked.length,items:todo.map(d=>({key:iso+'_'+d.dec+'_new',ref:ref(d.dec,'new')})),
      text:`${cn}, ${D[0].dec}s to ${D[D.length-1].dec}s: ${D.length} decades, researched one at a time.`+(done.length?` Researched: ${dl(done.map(d=>d.dec))}.`:'')+(asked.length?` Requested: ${dl(asked.map(d=>d.dec))}.`:'')
        +(n?` Not yet: ${dl(todo.map(d=>d.dec))}. One request is shared between ${n===1?'it':'these '+n}.`:'')}; }
  const prompt=$('stprompt').value||'', g=FG&&window.GKEY?window.GKEY(FG):null, t=iso&&!g&&TESTS.find(x=>x.iso===iso&&a>=x.y0&&b<=x.y1);
  const lis={key:[pl,a+'-'+b,PMODE,hash(prompt)].join('|').slice(0,200),ref:{pl,label:place+(g?' · '+fgName():''),y0:a,y1:b,mode:PMODE,filter:{pl,g,y0:a,y1:b,year:STY,until:STFROM!=null,time:FTM,place:FPL},prompt:prompt.slice(0,3000)}};
  if(t){ lis.done=true; lis.t=t; lis.text=`${cn}, ${t.y0}–${t.y1}. `+tested(t); } else lis.text=`Not run for ${place}${g?', '+fgName():''}, ${stWhen()}. The test uses exactly these filters.`;
  res.ctx={mode:'moment',iso,cn,place,D,year:a===b?STY:null}; lis.ctx={mode:'moment',cn:iso?cn:place,when:t?`${t.y0}–${t.y1}`:stWhen()};
  return [res,lis]; }

function genreRows(){ const id=GP, n=byId[id], d=DEFS[id], pl=PL[id], ref=k=>({gid:id,kind:k,label:n.name});
  const res=d&&pl&&pl.status==='full'?{done:true,text:'Definition, reference tracks and a full playlist.',key:'g:'+id+'_rerun',ref:ref('rerun')}
    :d?{text:pl?(pl.status==='none'?'No playable list yet: albums only.':'Thin: few recordings on file.'):'Definition and reference tracks, no playlist yet.',btn:'Request more',key:'g:'+id+'_sparse',ref:ref('sparse')}
    :{text:'Not researched yet.',key:'g:'+id+'_new',ref:ref('new')};
  const prompt=$('stprompt').hidden?'':($('stprompt').value||''), t=TESTS.find(x=>x.g===id);
  const lis=prompt?{key:['g:'+id,useLang(langOfMovement(id))||'en',hash(prompt)].join('|').slice(0,200),ref:{gid:id,label:n.name,prompt:prompt.slice(0,3000)}}
    :{key:'g:'+id+'|pending',ref:{gid:id,label:n.name}};
  if(t){ lis.done=true; lis.t=t; lis.text=tested(t); } else lis.text=prompt?'Not run for this playlist.':'No playlist to test yet. A request is kept and run once the research is done.';
  res.ctx={mode:'genre',id,name:n.name,d,pl}; lis.ctx={mode:'genre',name:n.name,noList:!prompt};
  return [res,lis]; }

let ROWS=[], busy=false; const MSG={};
/* ---- status: one coloured word per row, and a card that explains it to someone with no context ---- */
const TONE={ok:'ok',warn:'warn',none:'none',info:'info'};
const pill=(tone,label)=>`<span class="stp ${tone}"><i></i>${esc(label)}</span>`;
// what a row's state is, in one word: [tone, label]
function status(r){ const s=SENT[r.kind+'|'+r.key], asked=s&&s.status==='open';
  if(r.kind==='listener'){ if(r.t) return s&&s.rerun&&asked?['info','Rerun requested']:r.t.result==='pass'?['ok','Passed']:['warn','Below standard'];
    return asked?['info','Requested']:s&&s.status==='done'?['ok','Tested']:s&&s.status==='declined'?['none','Declined']:['none','Not tested']; }
  if(r.none) return ['none','Not available'];
  if(r.group) return r.n?(r.items.length<r.ctx.D.length?['plain','Partly researched']:['none','Not researched']):r.asked?['info','Requested']:['plain','Researched'];
  if(r.done) return s&&s.rerun&&asked?['info','Rerun requested']:['plain','Researched'];
  if(asked) return ['info','Requested']; if(s&&s.status==='done') return ['plain','Researched']; if(s&&s.status==='declined') return ['none','Declined'];
  if(r.btn) return ['plain','Thin'];
  const c=r.ctx||{}; if(c.mode==='moment'&&c.D&&c.D.length===1&&(ERA[c.iso]||{})[String(c.D[0].dec)]) return ['plain','Decade list only'];
  return ['none','Not researched']; }
/* Verification. The owner's rule is that nothing unverified is shown as sourced. DATA.verified holds, per scope, how many
   song links it has and how many of them the evidence-check script found on the page cited for them (built by
   tools/legacy_data.py). A genre row reads its genre; a place-and-time row adds up the decades in view. A list with every
   song checked is Verified, one with some is Partly verified, one with none (every list collected before claims were
   checked one by one) stays Unverified. */
const VER=DATA.verified||{g:{},c:{}};
function share(r){ const c=r.ctx||{};
  if(c.mode==='genre') return (VER.g||{})[c.id]||null;
  if(c.mode==='moment'&&c.iso){ const C=(VER.c||{})[c.iso]||{}; let links=0, checked=0;
    (c.D||[]).forEach(d=>{ const v=C[String(d.dec)]; if(v){ links+=v.links; checked+=v.checked; } }); return {links,checked}; }
  return null; }
const hasList=r=>r.kind==='research'&&!r.none&&(r.done||!!r.btn||(r.group&&r.items.length<r.ctx.D.length)||status(r)[1]==='Decade list only');
const verif=r=>{ if(!hasList(r)) return null; const v=share(r);
  if(v&&v.links&&v.checked===v.links) return ['ok','Sources checked'];
  if(v&&v.checked) return ['warn','Sources partly checked'];
  return ['warn','Sources not checked']; };
// the short line under the title: what the row is about
function where(r){ const c=r.ctx||{};
  if(r.kind==='listener') return c.mode==='genre'?(c.noList?'No playlist to test yet':'This playlist'):`${c.cn}, ${c.when}`;
  if(r.none) return r.text;
  if(c.mode==='genre') return c.name;
  const D=c.D||[]; return D.length>1?`${c.cn}, ${D[0].dec}s to ${D[D.length-1].dec}s: ${D.length} decades`:`${c.cn}, ${D[0].dec}s`; }
const sec=(h,body)=>body?`<p class="shlabel">${h}</p><div class="cardp">${body}</div>`:'';
const bar=(n)=>`<span class="scb" aria-hidden="true"><i style="width:${n*10}%"></i></span>`;
function listenerCard(r){ const c=r.ctx, t=r.t, st=status(r), genre=c.mode==='genre';
  const asks=genre?`Would someone who lives in this music hear this playlist and say “yes, this is ${c.name}”, and find the recordings that define it?`
    :`Would someone who grew up in ${c.cn} in those years hear the first songs of this playlist and say “this is the music of my youth”?`;
  const std=genre?'Not set yet. No genre playlist has been tested so far.':'A few years of the decade are tested, one invented local per year. Every year must score 8 out of 10 or more.';
  let res='';
  if(t){ const ys=t.years||[]; res='<div class="scl">'+t.scores.map((n,i)=>`<div class="scr ${n>=8?'ok':'warn'}"><span class="scy">${ys[i]!=null?ys[i]:'Year '+(i+1)}</span>${bar(n)}<b>${n}</b><span class="scv">${n>=8?'meets it':'below'}</span></div>`).join('')+'</div>'; }
  const how=t?`${day(t.date)}. The listener is simulated: an AI asked to judge as an ordinary person from that place and time. No real person has checked this list.${t.run?'':' This result is from before tests were recorded with their exact inputs, so treat it as provisional.'}`
    :'Not tested yet. A test is run by a simulated listener: an AI asked to judge as an ordinary person from that place and time.'+(st[1]==='Requested'?' Your request is in the queue for the next research run.':'');
  return `<div class="cardst">${pill(st[0],st[1])}<span class="fine">${esc(where(r))}</span></div>`
    +sec('What this test asks',esc(asks))+sec('The standard',std)+sec('Result',res)
    +sec(t&&t.result!=='pass'?'What fell short':'Note',t&&t.note?esc(t.note.charAt(0).toUpperCase()+t.note.slice(1))+'.':'')+sec('How it was run',how); }
function researchCard(r){ const c=r.ctx, st=status(r); let means, std, have='';
  if(r.none){ means='Research collects the songs people in one country actually heard, year by year, from the charts and press of the time.'; std='It is done for one country at a time, from the 1940s on.'; have=esc(r.text); }
  else if(c.mode==='genre'){ const pl=c.pl, d=c.d;
    means='A written definition of the genre, reference tracks that fit it, and a playlist of its defining recordings from its beginnings and its peak.';
    std='Full: 12 or more songs. Thin: the genre is researched but few recordings exist or were found. Longer lists, sized to how much of the genre exists, are planned.';
    have=!d?'Nothing yet. It has a name and a place on the tree.':`<div class="scl">${[['Definition',d?'yes':'no'],['Reference tracks',d.fits.length],['Playlist songs',pl?pl.intro.length+pl.peak.length:0],['Albums',pl&&pl.albums?pl.albums.length:0]].map(x=>`<div class="scr"><span class="scy wide">${x[0]}</span><b>${x[1]}</b></div>`).join('')}</div>${pl&&pl.note?`<p class="fine">${esc(pl.note)}</p>`:''}`; }
  else{ const D=c.D, L=YEARL[c.iso]||{}, E=(ERA[c.iso]||{});
    means=`For each year, the songs people in ${esc(c.cn)} actually heard: that year's hits from published charts and the press of the time, home-grown and foreign, each with its source.`;
    std='A year counts as researched with 6 or more home-grown songs backed by a source. Before that, a decade has one shared list. Deeper levels, sized to how many hits a country had, are planned.';
    have='<div class="scl">'+D.map(d=>{ const asked=SENT['research|'+c.iso+'_'+d.dec+'_new']; const p=d.has?pill('plain','By year'):asked?pill('info','Requested'):E[String(d.dec)]?pill('plain','Decade list'):pill('none','Nothing');
      return `<div class="scr"><span class="scy">${d.dec}s</span>${p}</div>`; }).join('')+'</div>';
    if(c.year!=null&&L[c.year]){ const n=(L[c.year].songs||[]).filter(x=>x[3]==='home').length; have+=`<p class="fine">${c.year}: ${n} home-grown song${n===1?'':'s'} with a source.</p>`; } }
  const v=verif(r);
  return `<div class="cardst">${pill(st[0],st[1])}${v?pill(v[0],v[1]):''}<span class="fine">${r.none?'':esc(where(r))}</span></div>`+sec('What research means here',means)+sec('The standard',std)+sec('What exists',have)
    +sec('Verification',!v?'':v[1]==='Sources checked'?'<b>Sources checked.</b> Every song in this list was found on the page cited for it, by a script. That shows the song exists and the source names it. It does not show that the year is the first release, that the song is typical, or that the source is right.'
      :v[1]==='Sources partly checked'?(x=>`<b>${x.checked} of ${x.links} songs checked against their source.</b> Each of those was found on the page cited for it, by a script. The others were collected before songs were checked one by one; treat them as a draft.`)(share(r))
      :'<b>Sources not checked yet.</b> These songs were collected before each one was checked against its source. Some may be wrong: a song that was not a hit there, a wrong year, a wrong artist. Each list is being checked song by song; until this one is, treat it as a draft.'); }
function openCard(i){ const r=ROWS[i]; if(!r||!window.UI||!UI.detail) return; UI.detail(r.title,r.kind==='listener'?listenerCard(r):researchCard(r)); }

function render(){ const box=$('ststatus'); if(!box||$('stpanel').hidden) return;
  const rs=GP!=null?genreRows():momentRows(); rs[0].kind='research'; rs[0].title=RT_; rs[1].kind='listener'; rs[1].title=LT_; ROWS=rs; const own=owner();
  box.innerHTML='<div class="rqs">'+rs.map((r,i)=>{ const s=SENT[r.kind+'|'+r.key], id=r.kind==='listener'?'sttest':'streq', st=status(r); let right='';
    const btn=(l,re)=>`<button class="lbtn" id="${id}" type="button" data-rqi="${i}"${re?' data-rerun="1"':''}${busy?' disabled':''}>${l}</button>`;
    if(r.none) right='';
    else if(r.group) right=r.n?`<button class="lbtn" id="${id}" type="button" data-rqi="${i}"${busy?' disabled':''}>Request ${r.n} decade${r.n===1?'':'s'}</button>`:'';
    else if(r.done) right=(s&&s.rerun&&s.status==='open')?'':(own?btn('Rerun',1):'');
    else if(!s) right=btn(r.btn||'Request');
    else if(s.status!=='open') right=own?btn('Rerun',1):'';
    const m=MSG[r.kind];
    return `<div class="rq" data-kind="${r.kind}"><button class="rqm" type="button" data-card="${i}"><b>${r.title}</b><span class="stps">${pill(st[0],st[1])}${(v=>v?pill(v[0],v[1]):'')(verif(r))}</span><small>${esc(where(r))}${m?` <span class="reqerr">${esc(m)}</span>`:''}</small></button><div class="rqr">${right||`<span class="rchev" aria-hidden="true">${window.UI?UI.ic('chev'):''}</span>`}</div></div>`; }).join('')+'</div>'; }
async function act(r,rerun){ if(busy||r.none) return; busy=true; render(); const k=r.kind+'|'+r.key;
  if(r.group){ const res=r.items.length?await sendMany(r.kind,r.items):{ok:true}; MSG[r.kind]=res.ok?'':res.msg; busy=false; render(); return; }
  const res=await send(r.kind,r.key,rerun?Object.assign({},r.ref,{rerun:true}):r.ref); let msg=res.ok?'':res.msg;
  if(res.ok&&rerun){ // the owner asks again for finished work: the request goes back on the open list
    if(res.status!=='open'){ try{ const cl=window.ACCOUNT.client(), {error}=await cl.from('requests').update({status:'open'}).eq('kind',r.kind).eq('key',r.key); if(error) msg=error.message||'The rerun could not be requested.'; }catch(e){ msg='The rerun could not be requested.'; } }
    if(!msg){ SENT[k]={at:Date.now(),status:'open',rerun:true}; keep(); } }
  MSG[r.kind]=msg; busy=false; render(); }
const box=$('ststatus'); if(box) box.addEventListener('click',e=>{ const b=e.target.closest('button[data-rqi]'); if(b){ const r=ROWS[+b.dataset.rqi]; if(r) act(r,!!b.dataset.rerun&&owner()); return; }
  const c=e.target.closest('[data-card]'); if(c) openCard(+c.dataset.card); });
stStatus=function(){ MSG.research=MSG.listener=''; try{ render(); }catch(e){} };
setTimeout(()=>{ try{ if(window.ACCOUNT&&window.ACCOUNT.onChange) window.ACCOUNT.onChange(()=>{ try{ render(); }catch(e){} }); }catch(e){} },0);
