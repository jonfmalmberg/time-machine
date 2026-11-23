/* Requests: "test this playlist with a synthetic listener" and "research this place and decade".
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
window.REQUESTS={send,sent:(kind,key)=>SENT[kind+'|'+key]||null};

/* ---- research: a place and decade with no year-by-year lists, or a thin year ---- */
const rkey=r=>r.iso+'_'+r.dec+'_'+(r.state==='none'?'new':'sparse'); let rmsg='';
researchLine=function(){ const r=researchState(); if(!r) return ''; const cn=esc(isoName(r.iso));
  const note=r.state==='sparse'?`<b>Thinly sourced:</b> only ${r.n} home-grown song${r.n===1?'':'s'} with evidence for ${STY}; the rest comes from the decade list.`
    :r.state==='none'?`No year-by-year research for ${cn} in the ${r.dec}s yet.`:'';
  if(!note) return '';
  const btn=SENT['research|'+rkey(r)]?' <span class="reqok">Request received. It is in the research queue.</span>'
    :` <button class="lbtn" id="streq" type="button">${r.state==='none'?`Request research for the ${r.dec}s`:'Request a fuller list'}</button>`;
  return `<p class="fine reqline">${note}${btn}${rmsg?` <span class="reqerr">${esc(rmsg)}</span>`:''}</p>`; };
askResearch=async function(){ const r=researchState(); if(!r||r.state==='year') return; const b=document.getElementById('streq'); if(b) b.disabled=true;
  const res=await send('research',rkey(r),{iso:r.iso,decade:+r.dec,year:STY,kind:r.state==='none'?'new':'sparse',label:isoName(r.iso)+', '+r.dec+'s'});
  rmsg=res.ok?'':res.msg; stPanelUpdate(); };

/* ---- synthetic listener: the button asks for a test of exactly the prompt on screen ---- */
const hash=s=>{ let h=5381; for(let i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))>>>0; return h.toString(36); };
function current(){ const ta=document.getElementById('stprompt'), prompt=ta?ta.value:''; if(!STP||!prompt) return null; const [y0,y1]=stRange(), pl=window.PLKEY?window.PLKEY(STP):'';
  return {key:[pl,Math.round(y0)+'-'+Math.round(y1),PMODE,hash(prompt)].join('|').slice(0,200),ref:{pl,label:placeName(),y0:Math.round(y0),y1:Math.round(y1),mode:PMODE,prompt:prompt.slice(0,3000)}}; }
const OKTXT='Request received. A synthetic listener will test this playlist in the next research run. The result goes into the research notes; it is not shown on this page yet.';
let lmsg='', busy=false;
function patch(){ const b=document.getElementById('sttest'), box=document.getElementById('stlisten'); if(!b) return; const cur=current();
  b.hidden=!cur; if(!cur){ if(box) box.innerHTML=''; return; }
  const done=!!SENT['listener|'+cur.key];
  b.textContent=done?'Listener test requested':'Request a listener test'; b.disabled=done||busy;
  if(box) box.innerHTML=done?`<p class="fine reqok">${OKTXT}</p>`:(lmsg?`<p class="fine reqerr">${esc(lmsg)}</p>`:'');
  b.onclick=async()=>{ const c=current(); if(!c||busy) return; busy=true; b.disabled=true; const res=await send('listener',c.key,c.ref); busy=false; lmsg=res.ok?'':res.msg; patch(); }; }
const spu0=stPanelUpdate; stPanelUpdate=function(){ const r=spu0.apply(this,arguments); try{ patch(); }catch(e){} return r; };
const ta=document.getElementById('stprompt'); if(ta) new MutationObserver(()=>{ try{ patch(); }catch(e){} }).observe(ta,{childList:true,characterData:true,subtree:true});
try{ patch(); }catch(e){}
