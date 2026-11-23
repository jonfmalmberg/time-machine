/* Accounts: sign in with Google through Supabase, and a small profile (handle, role, status).
   Only on the hosted site. A visitor who never signs in loads nothing from Supabase and never
   touches the database: the Supabase library is fetched on the first tap of "Continue with Google",
   or when this browser already holds a session, or on the way back from Google.
   The keys below are publishable keys, made to be public; what they can reach is decided by the
   access rules in db/*.sql. */
if(!STATIC) return;
const PROD_HOST='time-machine.jon-f-malmberg.workers.dev';
const PROJECTS={
  prod:{url:'https://gbexturopkketdzeopdf.supabase.co',key:'sb_publishable_rHZ5oxuln5GwfI1GktnHsw_ttp0e1-r'},
  dev:{url:'https://wpuowfaqrkgjqavhavcj.supabase.co',key:'sb_publishable_SnXygi9HXus_5GjIel4eWw_SxMS6aiI'}
};
/* The prod address uses the prod database; every other address (dev, previews, a local copy) uses dev. */
const ENV=location.hostname===PROD_HOST?'prod':'dev', CFG=PROJECTS[ENV];
const REF=new URL(CFG.url).hostname.split('.')[0];
const LIB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.js';
const HANDLE=/^[A-Za-z0-9_]{3,24}$/;
const h=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const S={phase:'out',user:null,profile:null,invites:[],msg:'',saved:false};   /* phase: out | busy | in */
const subs=[]; let client=null, loading=null;
const fire=()=>{ paint(); subs.forEach(f=>{ try{ f(); }catch(e){} }); };

function stored(){ try{ return !!localStorage.getItem('sb-'+REF+'-auth-token'); }catch(e){ return false; } }
const QS=new URLSearchParams(location.search), returning=QS.has('code'), failed=QS.get('error_description');
function cleanUrl(){ try{ history.replaceState(null,'',location.pathname+location.hash); }catch(e){} }
/* An invite link (?invite=CODE) is remembered across the trip to Google and used once signed in. */
const INV='wmft-invite';
const invGet=()=>{ try{ return localStorage.getItem(INV)||''; }catch(e){ return ''; } };
const invSet=v=>{ try{ v?localStorage.setItem(INV,v):localStorage.removeItem(INV); }catch(e){} };
const fmtCode=c=>String(c).replace(/(.{4})(?=.)/g,'$1-');
const inviteLink=c=>location.origin+location.pathname+'?invite='+fmtCode(c);
function openSheet(){ paint(); if(UI.sheet.current()!=='who') UI.sheet.open('who'); }

function load(){
  if(loading) return loading;
  loading=new Promise((ok,no)=>{ const s=document.createElement('script'); s.src=LIB; s.onload=ok; s.onerror=()=>no(new Error('The sign-in service could not be loaded.')); document.head.appendChild(s); })
    .then(()=>{
      client=window.supabase.createClient(CFG.url,CFG.key,{auth:{flowType:'pkce',detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}});
      /* The callback must not call Supabase directly (it would wait on itself), hence the timeout. */
      client.auth.onAuthStateChange((ev,session)=>{ setTimeout(()=>onSession(session),0); });
      return client; });
  loading.catch(()=>{ loading=null; });
  return loading;
}

async function readProfile(){
  const {data,error}=await client.from('profiles').select('handle,role,status').eq('id',S.user.id).maybeSingle();
  if(error){ S.msg='Your profile could not be read. '+(error.message||''); return; }
  S.profile=data||null; if(!data) S.msg='No profile exists for this account yet.';
  if(data&&data.status==='active'){ const r=await client.from('invites').select('code,expires_at').is('used_by',null).gt('expires_at',new Date().toISOString()).order('created_at'); S.invites=(r&&r.data)||[]; }
  else S.invites=[];
}
async function onSession(session){
  if(!session||!session.user){ S.phase='out'; S.user=null; S.profile=null; S.invites=[]; fire(); return; }
  const first=!S.user; S.user=session.user; S.phase='in';
  if(!first) return;                       /* token refreshes need no re-read */
  S.profile=null; fire();
  await readProfile();
  const code=invGet();
  if(code&&S.profile&&S.profile.status==='pending'){ await redeem(code,true); }
  else if(code){ invSet(''); }
  fire();
  if(returning||code){ cleanUrl(); openSheet(); }
}

async function signIn(){
  S.phase='busy'; S.msg=''; paint();
  try{ const c=await load();
    const {error}=await c.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});
    if(error) throw error;                      /* on success the browser leaves for Google */
  }catch(e){ S.phase='out'; S.msg=(e&&e.message)||'Sign-in did not start.'; paint(); }
}
async function signOut(){ if(!client) return; S.msg=''; await client.auth.signOut(); }
async function saveHandle(v){
  v=String(v||'').trim();
  if(!HANDLE.test(v)){ S.msg='A handle is 3 to 24 letters, digits or underscores.'; paint(); return; }
  const {error}=await client.from('profiles').update({handle:v}).eq('id',S.user.id);
  if(error) S.msg=error.code==='23505'?'That handle is taken.':'The handle was not saved. '+(error.message||'');
  else{ S.profile={...(S.profile||{}),handle:v}; S.msg=''; S.saved=true; setTimeout(()=>{ S.saved=false; paint(); },2200); }
  fire();
}
async function redeem(code,quiet){
  code=String(code||'').trim(); if(!code){ S.msg='Enter the invite code.'; paint(); return; }
  const {data,error}=await client.rpc('redeem_invite',{invite_code:code});
  invSet('');
  if(error){ S.msg=error.message||'That code did not work.'; if(!quiet) paint(); return; }
  if(data&&data.active){ S.msg='You are in. Welcome.'; await readProfile(); }
  else S.msg='Code accepted: '+(data?data.have:1)+' of '+(data?data.need:2)+' invites. One more is needed.';
  if(!quiet) fire();
}
async function newInvite(){
  const {data,error}=await client.rpc('create_invite');
  if(error){ S.msg=error.message||'No invite was made.'; paint(); return; }
  S.invites=[...S.invites,{code:data,expires_at:new Date(Date.now()+14*864e5).toISOString()}]; S.msg=''; paint();
}
async function copyLink(code,btn){
  const link=inviteLink(code);
  try{ await navigator.clipboard.writeText(link); btn.textContent='Copied'; }
  catch(e){ S.msg=link; paint(); return; }      /* no clipboard here: show the link to copy by hand */
  setTimeout(()=>{ if(btn.isConnected) btn.textContent='Copy link'; },1800);
}

/* The account sheet (opened from the round button at the top right) and that button. */
const box=document.getElementById('whopop'), whoBtn=document.getElementById('whobtn');
const daysLeft=t=>{ const d=Math.ceil((Date.parse(t)-Date.now())/864e5); return d<=1?'Expires within a day':'Expires in '+d+' days'; };
function paintBtn(){ if(!whoBtn) return; const p=S.profile, inn=S.phase==='in', name=p&&p.handle?p.handle:'';
  whoBtn.innerHTML=inn&&name?h(name.slice(0,1).toUpperCase()):UI.ic('person');
  whoBtn.classList.toggle('guest',!inn); whoBtn.classList.toggle('wait',inn&&!!p&&p.status!=='active');
  whoBtn.title=!inn?'Sign in':p&&p.status==='active'?(name||'Signed in'):'Signed in: under review'; whoBtn.setAttribute('aria-label','Account'); }
const ROLE={beta:'Beta tester',principal:'Principal tester',owner:'Owner'};
const NOTE={
  pending:['clock','Under review','Your profile has been requested. You get in when the owner approves it, or straight away with an invite code from a tester.'],
  suspended:['x','Suspended','This profile has been suspended by the owner.']};
function paint(){
  paintBtn(); if(!box) return;
  const p=S.profile, msg=S.msg?`<p class="fine acctmsg" role="status">${h(S.msg)}</p>`:'';
  if(S.phase!=='in'){
    const inv=invGet();
    box.innerHTML=`${inv?`<div class="acctnote ok"><span class="acctni">${UI.ic('ticket')}</span><span><b>You have an invite</b><small>Continue with Google and it is used automatically.</small></span></div>`:''}
      <div class="rows"><button type="button" class="rowb" id="acctin"${S.phase==='busy'?' disabled':''}><span class="rmedia">${UI.ic('person')}</span><span class="rmain"><b>${S.phase==='busy'?'Opening Google…':'Continue with Google'}</b><small>${inv?'Join as a tester':'Ask for a tester profile'}</small></span><span class="rchev">${UI.ic('chev')}</span></button></div>
      ${msg}<p class="fine">Browsing needs no account. Testers sign in so their travels, ratings and notes are kept and can shape what gets built next.</p>`;
    box.querySelector('#acctin').onclick=signIn; return; }
  const name=p&&p.handle?p.handle:'', st=p?p.status:'', active=st==='active', note=NOTE[st];
  const sub=!p?'Reading your profile…':active?(ROLE[p.role]||p.role):note?note[1]:st;
  box.innerHTML=`${ENV==='dev'?'<p class="shlabel">Dev database</p>':''}
    ${note?`<div class="acctnote ${st}"><span class="acctni">${UI.ic(note[0])}</span><span><b>${note[1]}</b><small>${note[2]}</small></span></div>`:''}
    <div class="rows">
      <div class="rowb acctme"><span class="rmedia"><span class="avatar sm">${name?h(name.slice(0,1).toUpperCase()):UI.ic('person')}</span></span><span class="rmain"><b>${name?h(name):'No handle yet'}</b><small class="acctst ${st}">${active?UI.ic('check'):''}${h(sub)}</small></span></div>
      <label class="rowb acctrow"><span class="acctlab">Handle</span><input id="accth" type="text" maxlength="24" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="${name?'':'Choose one: letters, digits, _'}" value="${h(name)}"${p?'':' disabled'}><span class="acctok" id="acctok"${S.saved?'':' hidden'}>${UI.ic('check')}Saved</span><button type="button" class="lbtn primary" id="acctsave" hidden>Save</button></label>
      ${st==='pending'?`<label class="rowb acctrow"><span class="acctlab">Invite</span><input id="acctcode" type="text" maxlength="20" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="Code, if you have one"><button type="button" class="lbtn primary" id="acctuse" hidden>Use</button></label>`:''}
    </div>${msg}
    ${active?`<p class="shlabel">Invite a tester</p><div class="rows">
      ${S.invites.map(i=>`<div class="rowb acctinv"><span class="rmain"><b class="acctcode">${h(fmtCode(i.code))}</b><small>Works once · ${h(daysLeft(i.expires_at))}</small></span><button type="button" class="lbtn" data-copy="${h(i.code)}">Copy link</button></div>`).join('')}
      <button type="button" class="rowb acctnew" id="acctnew">New invite link</button></div>
      <p class="fine">Whoever opens the link and signs in becomes a tester, vouched for by you.</p>`:''}
    <div class="rows acctoutw"><button type="button" class="rowb acctout" id="acctout">Sign out</button></div>
    <p class="fine">Kept for your account: your handle, tester status, the trips you take with your ratings and notes, and which parts of the app you use.</p>`;
  const f=box.querySelector('#accth'), sv=box.querySelector('#acctsave'), ok=box.querySelector('#acctok'), go=()=>saveHandle(f.value);
  f.oninput=()=>{ const ch=f.value.trim()!==name&&f.value.trim()!==''; sv.hidden=!ch; if(ch) ok.hidden=true; };
  sv.onclick=go; f.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); if(!sv.hidden) go(); } };
  const c=box.querySelector('#acctcode'), use=box.querySelector('#acctuse');
  if(c){ c.oninput=()=>{ use.hidden=!c.value.trim(); }; use.onclick=()=>redeem(c.value); c.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); redeem(c.value); } }; }
  box.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>copyLink(b.dataset.copy,b));
  const nw=box.querySelector('#acctnew'); if(nw) nw.onclick=newInvite;
  box.querySelector('#acctout').onclick=signOut;
}

if(whoBtn) whoBtn.addEventListener('click',openSheet);
window.ACCOUNT={ env:ENV, open:openSheet, user:()=>S.user, profile:()=>S.profile,
  isActive:()=>!!(S.profile&&S.profile.status==='active'), isOwner:()=>!!(S.profile&&S.profile.status==='active'&&S.profile.role==='owner'),
  client:()=>client, onChange:f=>subs.push(f) };

const arrived=QS.get('invite');
if(arrived){ invSet(arrived); cleanUrl(); }
if(failed){ S.msg=/user cap/i.test(failed)?'Sign-ups are closed for now: the tester list is full.':'Sign-in did not finish. '+failed; cleanUrl(); }
paint();
if(returning||stored()){ S.phase=returning?'busy':'out'; paint(); load().catch(e=>{ S.phase='out'; S.msg=e.message; paint(); }); }
else if(arrived) setTimeout(openSheet,600);
