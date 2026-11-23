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
  if(t){ lis.done=true; lis.text=`${cn}, ${t.y0}–${t.y1}. `+tested(t); } else lis.text=`Not run for ${place}${g?', '+fgName():''}, ${stWhen()}. The test uses exactly these filters.`;
  return [res,lis]; }

function genreRows(){ const id=GP, n=byId[id], d=DEFS[id], pl=PL[id], ref=k=>({gid:id,kind:k,label:n.name});
  const res=d&&pl&&pl.status==='full'?{done:true,text:'Definition, reference tracks and a full playlist.',key:'g:'+id+'_rerun',ref:ref('rerun')}
    :d?{text:pl?(pl.status==='none'?'No playable list yet: albums only.':'Thin: few recordings on file.'):'Definition and reference tracks, no playlist yet.',btn:'Request more',key:'g:'+id+'_sparse',ref:ref('sparse')}
    :{text:'Not researched yet.',key:'g:'+id+'_new',ref:ref('new')};
  const prompt=$('stprompt').hidden?'':($('stprompt').value||''), t=TESTS.find(x=>x.g===id);
  const lis=prompt?{key:['g:'+id,useLang(langOfMovement(id))||'en',hash(prompt)].join('|').slice(0,200),ref:{gid:id,label:n.name,prompt:prompt.slice(0,3000)}}
    :{key:'g:'+id+'|pending',ref:{gid:id,label:n.name}};
  if(t){ lis.done=true; lis.text=tested(t); } else lis.text=prompt?'Not run for this playlist.':'No playlist to test yet. A request is kept and run once the research is done.';
  return [res,lis]; }

let ROWS=[], busy=false; const MSG={};
function render(){ const box=$('ststatus'); if(!box||$('stpanel').hidden) return;
  const rs=GP!=null?genreRows():momentRows(); rs[0].kind='research'; rs[0].title=RT_; rs[1].kind='listener'; rs[1].title=LT_; ROWS=rs; const own=owner();
  box.innerHTML='<div class="rqs">'+rs.map((r,i)=>{ const s=SENT[r.kind+'|'+r.key], id=r.kind==='listener'?'sttest':'streq'; let sub=esc(r.text), right;
    const btn=(l,re)=>`<button class="lbtn" id="${id}" type="button" data-rqi="${i}"${re?' data-rerun="1"':''}${busy?' disabled':''}>${l}</button>`, tag=(l,ok)=>`<span class="rqb${ok?' ok':''}">${l}</span>`;
    if(r.none) right='';
    else if(r.group) right=r.n?`<button class="lbtn" id="${id}" type="button" data-rqi="${i}"${busy?' disabled':''}>Request ${r.n} decade${r.n===1?'':'s'}</button>`:tag(r.asked?'Requested':'Done',1);
    else if(r.done){ if(s&&s.rerun&&s.status==='open'){ right=tag('Rerun requested',1); } else right=tag('Done',1)+(own?btn('Rerun',1):''); }
    else if(!s) right=btn(r.btn||'Request');
    else if(s.status==='open'){ right=tag(s.rerun?'Rerun requested':'Requested',1); sub=(r.kind==='listener'?'':sub+' ')+'Request received. '+(r.kind==='listener'?'A synthetic listener will test this in the next research run; the result goes into the research notes.':'It is in the research queue.'); }
    else if(s.status==='done'){ right=tag('Done',1)+(own?btn('Rerun',1):''); sub+=' This request has already been carried out.'; }
    else{ right=tag('Declined')+(own?btn('Rerun',1):''); sub+=' This request was declined.'; }
    const m=MSG[r.kind]; return `<div class="rq" data-kind="${r.kind}"><div class="rqm"><b>${r.title}</b><small>${sub}${m?` <span class="reqerr">${esc(m)}</span>`:''}</small></div><div class="rqr">${right}</div></div>`; }).join('')+'</div>'; }
async function act(r,rerun){ if(busy||r.none) return; busy=true; render(); const k=r.kind+'|'+r.key;
  if(r.group){ const res=r.items.length?await sendMany(r.kind,r.items):{ok:true}; MSG[r.kind]=res.ok?'':res.msg; busy=false; render(); return; }
  const res=await send(r.kind,r.key,rerun?Object.assign({},r.ref,{rerun:true}):r.ref); let msg=res.ok?'':res.msg;
  if(res.ok&&rerun){ // the owner asks again for finished work: the request goes back on the open list
    if(res.status!=='open'){ try{ const cl=window.ACCOUNT.client(), {error}=await cl.from('requests').update({status:'open'}).eq('kind',r.kind).eq('key',r.key); if(error) msg=error.message||'The rerun could not be requested.'; }catch(e){ msg='The rerun could not be requested.'; } }
    if(!msg){ SENT[k]={at:Date.now(),status:'open',rerun:true}; keep(); } }
  MSG[r.kind]=msg; busy=false; render(); }
const box=$('ststatus'); if(box) box.addEventListener('click',e=>{ const b=e.target.closest('button[data-rqi]'); if(!b) return; const r=ROWS[+b.dataset.rqi]; if(r) act(r,!!b.dataset.rerun&&owner()); });
stStatus=function(){ MSG.research=MSG.listener=''; try{ render(); }catch(e){} };
setTimeout(()=>{ try{ if(window.ACCOUNT&&window.ACCOUNT.onChange) window.ACCOUNT.onChange(()=>{ try{ render(); }catch(e){} }); }catch(e){} },0);
