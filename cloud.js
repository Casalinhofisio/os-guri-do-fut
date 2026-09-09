(()=>{
const PROJECT_URL='https://vkizqqrccyvcabfxwyhz.supabase.co';
const PUBLISHABLE_KEY='sb_publishable_zQ-Go0vKh8aGdmZ53W7_2Q_meH4fpOo';
const SAVE_KEY='futchebol-guri-save-v3';
const META_KEY='futchebol-guri-cloud-meta-v1';
const SLOT='Carreira principal';
let client=null,user=null,lastRaw=null,syncTimer=null,syncing=false;
const $=id=>document.getElementById(id);
const safeJson=s=>{try{return JSON.parse(s)}catch{return null}};
const rawSave=()=>localStorage.getItem(SAVE_KEY);
const setStatus=(msg,kind='')=>{const el=$('cloudStatus');if(el){el.textContent=msg;el.dataset.kind=kind}};
const setAuthMsg=(msg,ok=false)=>{const el=$('authMsg');if(el){el.textContent=msg;el.style.color=ok?'#7ee2a8':'#ffc98b'}};
const meta=()=>safeJson(localStorage.getItem(META_KEY))||{};
const writeMeta=o=>localStorage.setItem(META_KEY,JSON.stringify(o));

async function init(){
  if(!window.supabase?.createClient){setStatus('Nuvem indisponível neste momento.');return}
  client=window.supabase.createClient(PROJECT_URL,PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const {data}=await client.auth.getSession();
  user=data?.session?.user||null;
  client.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;updateStartUI();});
  await updateStartUI();
}

async function cloudRow(){
  if(!user)return null;
  const {data,error}=await client.from('career_saves').select('*').eq('user_id',user.id).eq('slot_name',SLOT).maybeSingle();
  if(error){console.warn('cloudRow',error);return null}
  return data||null;
}

async function uploadRaw(raw){
  if(!user||!raw||syncing)return false;
  const state=safeJson(raw); if(!state)return false;
  syncing=true;
  const payload={user_id:user.id,slot_name:SLOT,club_name:state.club||state.clubName||null,season:state.year||state.season||null,division:state.division||null,game_state:state,updated_at:new Date().toISOString()};
  const {data,error}=await client.from('career_saves').upsert(payload,{onConflict:'user_id,slot_name'}).select('updated_at').single();
  syncing=false;
  if(error){console.warn('cloud upload',error);badge('☁️ erro ao salvar');return false}
  lastRaw=raw;writeMeta({updated_at:data.updated_at,user_id:user.id});badge('☁️ salvo');return true;
}

async function pullRow(row){
  if(!row?.game_state)return false;
  localStorage.setItem(SAVE_KEY,JSON.stringify(row.game_state));
  lastRaw=localStorage.getItem(SAVE_KEY);
  writeMeta({updated_at:row.updated_at,user_id:user?.id});
  return true;
}

async function reconcile(){
  if(!user)return {mode:'local'};
  const row=await cloudRow();
  const local=rawSave();
  if(row&&!local){await pullRow(row);return {mode:'pulled',row}}
  if(!row&&local){await uploadRaw(local);return {mode:'uploaded'}}
  if(!row&&!local)return {mode:'empty'};
  const m=meta();
  if(m.user_id===user.id&&m.updated_at){
    const cloudT=Date.parse(row.updated_at||0),localT=Date.parse(m.updated_at||0);
    if(cloudT>localT+1000){await pullRow(row);return {mode:'pulled',row}}
  }
  await uploadRaw(local);return {mode:'uploaded',row};
}

async function updateStartUI(){
  const email=$('accountEmail'),logout=$('logoutBtn');
  if(!client)return;
  if(user){
    if(email)email.textContent=user.email||'Professor conectado';
    if(logout)logout.style.display='inline-flex';
    setStatus('☁️ Conta conectada. Save automático ativado.','ok');
    const r=await cloudRow();
    const cont=$('continueBtn');
    if(cont&&r&&!rawSave())cont.textContent='Continuar carreira da nuvem';
  }else{
    if(email)email.textContent='';
    if(logout)logout.style.display='none';
    setStatus('Jogue localmente ou entre para salvar na nuvem.');
  }
}

async function signIn(){
  const email=$('authEmail')?.value.trim(),password=$('authPassword')?.value||'';
  if(!email||password.length<6){setAuthMsg('Preenche o e-mail e uma senha com pelo menos 6 caracteres.');return}
  setAuthMsg('Entrando...');
  const {data,error}=await client.auth.signInWithPassword({email,password});
  if(error){setAuthMsg('Não consegui entrar: '+error.message);return}
  user=data.user;await reconcile();setAuthMsg('Conta conectada. Bah, Professor! ☁️',true);await updateStartUI();setTimeout(closeCloud,700);
}

async function signUp(){
  const email=$('authEmail')?.value.trim(),password=$('authPassword')?.value||'',name=$('authName')?.value.trim()||'Professor';
  if(!email||password.length<6){setAuthMsg('Preenche o e-mail e uma senha com pelo menos 6 caracteres.');return}
  setAuthMsg('Criando tua conta...');
  const {data,error}=await client.auth.signUp({email,password,options:{data:{display_name:name},emailRedirectTo:location.origin+location.pathname}});
  if(error){setAuthMsg('Não consegui criar: '+error.message);return}
  if(data.session){user=data.user;await reconcile();setAuthMsg('Conta criada e conectada! ☁️',true);await updateStartUI();setTimeout(closeCloud,700)}
  else setAuthMsg('Conta criada. Confirma o e-mail e depois volta para entrar.',true);
}

async function logout(){
  await client.auth.signOut();user=null;localStorage.removeItem(META_KEY);await updateStartUI();setAuthMsg('Conta desconectada.',true);
}

async function clearCareer(){
  localStorage.removeItem(SAVE_KEY);localStorage.removeItem(META_KEY);lastRaw=null;
  if(user){await client.from('career_saves').delete().eq('user_id',user.id).eq('slot_name',SLOT)}
}

async function prepareGame(){
  if(!client)await init();
  if(user)await reconcile();
}

function badge(text){
  let el=document.getElementById('fgCloudBadge');
  if(!el){el=document.createElement('div');el.id='fgCloudBadge';Object.assign(el.style,{position:'fixed',right:'12px',bottom:'12px',zIndex:'99999',background:'#08160dcc',border:'1px solid #31543b',borderRadius:'999px',padding:'7px 11px',font:'12px system-ui',color:'#bfe6ca',boxShadow:'0 8px 24px #0008'});document.body.appendChild(el)}
  el.textContent=text;
}

function attachGame(){
  if(!client)init();
  badge(user?'☁️ nuvem conectada':'💾 save local');
  lastRaw=rawSave();
  clearInterval(syncTimer);
  syncTimer=setInterval(async()=>{
    const r=rawSave();
    if(user&&r&&r!==lastRaw)await uploadRaw(r);
    else if(r!==lastRaw)lastRaw=r;
  },2500);
  window.addEventListener('online',()=>{if(user&&rawSave())uploadRaw(rawSave())});
}

function openCloud(){const m=$('cloudModal');if(m)m.style.display='grid';setAuthMsg('')}
function closeCloud(){const m=$('cloudModal');if(m)m.style.display='none'}
window.FGCloud={init,signIn,signUp,logout,clearCareer,prepareGame,attachGame,openCloud,closeCloud,reconcile};
window.addEventListener('DOMContentLoaded',init);
})();