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

const S={phase:'out',user:null,profile:null,msg:''};   /* phase: out | busy | in */
const subs=[]; let client=null, loading=null;
const fire=()=>{ paint(); subs.forEach(f=>{ try{ f(); }catch(e){} }); };

function stored(){ try{ return !!localStorage.getItem('sb-'+REF+'-auth-token'); }catch(e){ return false; } }
const QS=new URLSearchParams(location.search), returning=QS.has('code'), failed=QS.get('error_description');
function cleanUrl(){ try{ history.replaceState(null,'',location.pathname+location.hash); }catch(e){} }

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

async function onSession(session){
  if(!session||!session.user){ S.phase='out'; S.user=null; S.profile=null; fire(); return; }
  const first=!S.user; S.user=session.user; S.phase='in';
  if(first){ S.profile=null; fire(); }
  const {data,error}=await client.from('profiles').select('handle,role,status').eq('id',S.user.id).maybeSingle();
  if(error) S.msg='Your profile could not be read. '+(error.message||'');
  else{ S.profile=data||null; if(!data) S.msg='No profile exists for this account yet.'; }
  fire();
  if(returning&&first){ cleanUrl(); const b=document.getElementById('whobtn'); if(b&&UI.sheet.current()!=='sheet-who'&&UI.sheet.current()!=='who') b.click(); }
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
  else{ S.profile={...(S.profile||{}),handle:v}; S.msg='Saved.'; }
  fire();
}

/* The account block sits at the top of the "Who is travelling?" sheet. */
const sheet=document.getElementById('sheet-who'), body=document.getElementById('whopop');
const box=document.createElement('div'); box.id='acct'; if(sheet&&body) sheet.insertBefore(box,body);
const STATUS={pending:'Profile requested. Waiting to be let in.',active:'Active',suspended:'Suspended'};
const ROLE={beta:'Beta tester',principal:'Principal tester',owner:'Owner'};
function paint(){
  if(!box.isConnected) return;
  const p=S.profile, msg=S.msg?`<p class="fine acctmsg" role="status">${h(S.msg)}</p>`:'';
  if(S.phase!=='in'){
    box.innerHTML=`<p class="shlabel">Account</p>
      <div class="rows"><button type="button" class="rowb" id="acctin"${S.phase==='busy'?' disabled':''}><span class="rmedia">${UI.ic('person')}</span><span class="rmain"><b>${S.phase==='busy'?'Opening Google…':'Continue with Google'}</b><small>Ask for a tester profile</small></span><span class="rchev">${UI.ic('chev')}</span></button></div>
      ${msg}<p class="fine">Browsing needs no account. Signing in keeps a handle and your tester status, nothing else.</p>
      <p class="shlabel">On this device</p>`;
    box.querySelector('#acctin').onclick=signIn; return; }
  const name=p&&p.handle?p.handle:'', sub=p?(p.status==='active'?(ROLE[p.role]||p.role):(STATUS[p.status]||p.status)):'Reading your profile…';
  box.innerHTML=`<p class="shlabel">Account${ENV==='dev'?' · dev':''}</p>
    <div class="rows">
      <div class="rowb acctme"><span class="rmedia"><span class="avatar sm">${name?h(name.slice(0,1).toUpperCase()):UI.ic('person')}</span></span><span class="rmain"><b>${name?h(name):'No handle yet'}</b><small>${h(sub)}</small></span></div>
      <label class="rowb acctrow"><span class="acctlab">Handle</span><input id="accth" type="text" maxlength="24" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="letters, digits, _" value="${h(name)}"${p?'':' disabled'}><button type="button" class="lbtn" id="acctsave"${p?'':' disabled'}>Save</button></label>
      <button type="button" class="rowb acctout" id="acctout">Sign out</button>
    </div>${msg}
    <p class="shlabel">On this device</p>`;
  const f=box.querySelector('#accth'), go=()=>saveHandle(f.value);
  box.querySelector('#acctsave').onclick=go; f.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); go(); } };
  box.querySelector('#acctout').onclick=signOut;
}

window.ACCOUNT={ env:ENV, user:()=>S.user, profile:()=>S.profile,
  isActive:()=>!!(S.profile&&S.profile.status==='active'), isOwner:()=>!!(S.profile&&S.profile.status==='active'&&S.profile.role==='owner'),
  client:()=>client, onChange:f=>subs.push(f) };

if(failed){ S.msg=/user cap/i.test(failed)?'Sign-ups are closed for now: the tester list is full.':'Sign-in did not finish. '+failed; cleanUrl(); }
paint();
if(returning||stored()){ S.phase=returning?'busy':'out'; paint(); load().catch(e=>{ S.phase='out'; S.msg=e.message; paint(); }); }
