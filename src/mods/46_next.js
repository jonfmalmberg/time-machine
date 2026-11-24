/* Onward stops at the foot of the Songs pane (idea "next-stop"; decision D27): from a genre, what it follows and what
   it leads to on the tree; from a place and time, the same place ten years either way. One tap, the sheet stays open. */
const SCN=id=>(typeof SC!=='undefined'&&SC[id]?SC[id][0]:0);
function nextHtml(){
  if(typeof GP!=='undefined'&&GP!=null&&byId[GP]){ const n=byId[GP];
    const par=(n.parents||[]).filter(x=>byId[x]).slice(0,3), kids=N.filter(x=>(x.parents||[]).includes(GP)).sort((a,b)=>SCN(b.id)-SCN(a.id)).slice(0,4).map(x=>x.id);
    if(!par.length&&!kids.length) return '';
    const chip=(id,dir)=>`<button type="button" class="nxchip" data-nxg="${id}"><i style="background:${regColor(byId[id].reg)}"></i><span>${esc(byId[id].name)}</span><small>${dir}</small></button>`;
    return `<p class="nxlab">Where next</p><div class="nxrow">${par.map(x=>chip(x,'earlier')).join('')}${kids.map(x=>chip(x,'later')).join('')}</div>`; }
  if(!STP) return ''; const [a,b]=stRange(); if(b-a>30) return '';
  const step=Math.max(10,Math.round((b-a+1)/10)*10), out=[];
  if(a-step>=1900) out.push(`<button type="button" class="nxchip" data-nxy="${-step}"><span>${esc(placeName().split(', ')[0])}</span><small>${step} years earlier</small></button>`);
  if(b+step<=T1+9&&STY+step<=T1) out.push(`<button type="button" class="nxchip" data-nxy="${step}"><span>${esc(placeName().split(', ')[0])}</span><small>${step} years later</small></button>`);
  return out.length?`<p class="nxlab">Where next</p><div class="nxrow">${out.join('')}</div>`:''; }
const upd0=stPanelUpdate;
stPanelUpdate=function(){ const r=upd0.apply(this,arguments);
  try{ const pane=document.querySelector('#stpanel [data-stpane="songs"]'); if(pane){ let el=document.getElementById('stnext'); if(!el){ el=document.createElement('div'); el.id='stnext'; el.className='stnext'; pane.appendChild(el); }
      const h=nextHtml(); el.innerHTML=h; el.hidden=!h; } }catch(e){} return r; };
document.addEventListener('click',e=>{ const c=e.target.closest&&e.target.closest('.nxchip'); if(!c) return;
  try{ if(c.dataset.nxg){ window.TRACK&&window.TRACK('next',{g:c.dataset.nxg}); openGenrePlaylist(c.dataset.nxg); }
    else if(c.dataset.nxy){ window.TRACK&&window.TRACK('next',{y:+c.dataset.nxy}); setYear(Math.max(1900,Math.min(T1,STY+ +c.dataset.nxy))); stPanelOpen=true; stBarUI(); stPanelUpdate(); const p=document.getElementById('stpanel'); if(p) p.scrollTop=0; } }catch(_){} });
