(()=>{
const POS_LABEL={GOL:'GOL',LD:'LD',LE:'LE',ZAG:'ZAG',VOL:'VOL',MC:'MC',MEI:'MEI',PD:'PD',PE:'PE',ATA:'ATA'};
const formations={
 '4-4-2':[
  {p:'GOL',x:50,y:91},{p:'LD',x:82,y:73},{p:'ZAG',x:61,y:77},{p:'ZAG',x:39,y:77},{p:'LE',x:18,y:73},
  {p:'PD',x:82,y:47},{p:'MC',x:61,y:53},{p:'MC',x:39,y:53},{p:'PE',x:18,y:47},{p:'ATA',x:61,y:22},{p:'ATA',x:39,y:22}
 ],
 '4-3-3':[
  {p:'GOL',x:50,y:91},{p:'LD',x:82,y:73},{p:'ZAG',x:61,y:77},{p:'ZAG',x:39,y:77},{p:'LE',x:18,y:73},
  {p:'MC',x:68,y:51},{p:'VOL',x:50,y:58},{p:'MC',x:32,y:51},{p:'PD',x:78,y:22},{p:'ATA',x:50,y:16},{p:'PE',x:22,y:22}
 ],
 '4-2-3-1':[
  {p:'GOL',x:50,y:91},{p:'LD',x:82,y:73},{p:'ZAG',x:61,y:77},{p:'ZAG',x:39,y:77},{p:'LE',x:18,y:73},
  {p:'VOL',x:62,y:57},{p:'VOL',x:38,y:57},{p:'PD',x:78,y:36},{p:'MEI',x:50,y:34},{p:'PE',x:22,y:36},{p:'ATA',x:50,y:15}
 ],
 '3-5-2':[
  {p:'GOL',x:50,y:91},{p:'ZAG',x:72,y:75},{p:'ZAG',x:50,y:79},{p:'ZAG',x:28,y:75},
  {p:'LD',x:86,y:49},{p:'MC',x:65,y:53},{p:'VOL',x:50,y:59},{p:'MC',x:35,y:53},{p:'LE',x:14,y:49},{p:'ATA',x:62,y:20},{p:'ATA',x:38,y:20}
 ],
 '4-1-4-1':[
  {p:'GOL',x:50,y:91},{p:'LD',x:82,y:73},{p:'ZAG',x:61,y:77},{p:'ZAG',x:39,y:77},{p:'LE',x:18,y:73},{p:'VOL',x:50,y:60},
  {p:'PD',x:82,y:39},{p:'MC',x:62,y:45},{p:'MC',x:38,y:45},{p:'PE',x:18,y:39},{p:'ATA',x:50,y:16}
 ]
};
function player(name){return G.roster.find(p=>p[0]===name)}
function compat(pp,slot){
 if(pp==='GOL'||slot==='GOL')return pp==='GOL'&&slot==='GOL';
 const ok={
  LD:['LD','LE'],LE:['LE','LD'],
  ZAG:['ZAG','VOL','LD','LE'],
  VOL:['VOL','MC','LD','LE'],
  MC:['MC','VOL','MEI'],
  MEI:['MEI','MC','ATA','PD','PE'],
  ATA:['ATA','PD','PE','MEI'],PD:['PD','PE','ATA','MEI'],PE:['PE','PD','ATA','MEI']
 };
 return (ok[pp]||[pp]).includes(slot);
}
function init(){
 if(!window.G)return;
 G.lineupMeta=G.lineupMeta||{};
 G.lineupMeta.selectedSlot=Number.isInteger(G.lineupMeta.selectedSlot)?G.lineupMeta.selectedSlot:null;
 G.lineupMeta.subLimit=5;
 G.lineupMeta.subsUsed=G.lineupMeta.subsUsed||0;
}
function validInitial(){
 const active=G.roster.filter(p=>!(G.susp?.[pkey(p[0])]>0));
 let names=(G.lineup||[]).filter(n=>active.some(p=>p[0]===n));
 names=[...new Set(names)];
 for(const p of active)if(names.length<11&&!names.includes(p[0]))names.push(p[0]);
 G.lineup=names.slice(0,11);
}
function swapWithBench(name){
 init();
 const i=G.lineupMeta.selectedSlot;
 if(i==null){toast('Primeiro clica em um jogador do campo.');return}
 const np=player(name),slot=(formations[$('formation')?.value||'4-4-2']||formations['4-4-2'])[i];
 if(!np||!slot)return;
 if(np[1]==='GOL'&&slot.p!=='GOL'){toast('Goleiro só pode jogar no gol.');return}
 if(slot.p==='GOL'&&np[1]!=='GOL'){toast('No gol só entra goleiro.');return}
 const old=G.lineup[i];
 const already=G.lineup.indexOf(name);
 if(already>=0){G.lineup[already]=old}
 G.lineup[i]=name;
 G.lineupMeta.selectedSlot=null;
 saveGame(false);window.renderLineup();
}
function selectSlot(i){init();G.lineupMeta.selectedSlot=i;window.renderLineup()}
function autoPick(){
 init();
 const f=$('formation')?.value||'4-4-2',slots=formations[f],available=G.roster.filter(p=>!(G.susp?.[pkey(p[0])]>0)),used=new Set(),out=[];
 slots.forEach(s=>{let best=available.filter(p=>!used.has(p[0])&&(s.p==='GOL'?p[1]==='GOL':p[1]!=='GOL')).sort((a,b)=>(compat(b[1],s.p)-compat(a[1],s.p))||b[2]-a[2])[0];if(best){used.add(best[0]);out.push(best[0])}});
 G.lineup=out;G.lineupMeta.selectedSlot=null;saveGame(false);window.renderLineup();toast('Time organizado automaticamente.');
}
window.renderLineup=function(){
 init();validInitial();
 const pitch=$('pitch'),bench=$('bench');if(!pitch||!bench)return;
 const f=$('formation')?.value||'4-4-2',slots=formations[f]||formations['4-4-2'];
 pitch.className='pitch fgPitch';
 pitch.innerHTML='<div class="fgMid"></div>'+slots.map((s,i)=>{const n=G.lineup[i]||'',p=player(n),bad=p&&!compat(p[1],s.p),sel=G.lineupMeta.selectedSlot===i,susp=p&&G.susp?.[pkey(p[0])]>0;return `<button type="button" class="fgPlayer ${bad?'bad':''} ${sel?'selected':''} ${susp?'susp':''}" style="left:${s.x}%;top:${s.y}%" onclick="FGLineup.selectSlot(${i})"><small>${POS_LABEL[s.p]||s.p}</small><b>${n||'Vazio'}</b>${p?`<em>${p[1]} • ${p[2]}</em>`:''}${bad?'<span>⚠ FORA DE POSIÇÃO</span>':''}</button>`}).join('');
 const reserves=G.roster.filter(p=>!G.lineup.includes(p[0]));
 bench.innerHTML=`<div class="fgBenchHead"><b>Banco e reservas</b><span>${reserves.length} jogadores</span></div><div class="fgBenchList">${reserves.map(p=>{const su=G.susp?.[pkey(p[0])]>0;return `<button type="button" class="fgBenchPlayer ${su?'susp':''}" ${su?'disabled':''} onclick="FGLineup.swap('${p[0].replace(/'/g,"\\'")}')"><b>${p[0]}</b><span>${p[1]} • força ${p[2]}</span>${su?'<em>SUSPENSO</em>':''}</button>`}).join('')}</div><div class="fgSubRule">🔄 Durante a partida: máximo de <b>5 substituições</b>.</div>`;
 if($('roles')){let roleNames=[['captain','Capitão'],['penalty','Pênaltis'],['freeKick','Faltas'],['corner','Escanteios']];$('roles').innerHTML=roleNames.map(([k,l])=>`<div class=rolebox><b>${l}</b><select onchange="G.roles['${k}']=this.value;saveGame(false)">${G.roster.map(p=>`<option ${G.roles[k]===p[0]?'selected':''}>${p[0]}</option>`).join('')}</select></div>`).join('')}
 if($('discipline'))$('discipline').innerHTML=G.roster.map(p=>{let k=pkey(p[0]),y=G.cards[k]||0,su=G.susp[k]||0;return `<div class=item><b>${p[0]}</b> • amarelos: <span class="statusPill yellow">${y}/3</span> ${su?'<span class="statusPill susp">SUSPENSO 1 JOGO</span>':''}</div>`}).join('');
};
window.saveLineup=function(){init();if((G.lineup||[]).length!==11)return toast('Escala 11 jogadores primeiro.');if(new Set(G.lineup).size!==11)return toast('Tem jogador repetido na escalação.');const slots=formations[$('formation')?.value||'4-4-2'];for(let i=0;i<11;i++){const p=player(G.lineup[i]);if((slots[i].p==='GOL')!==(p?.[1]==='GOL'))return toast('Confere o goleiro: no gol só pode GOL.')}addNews('Escalação definida','Professor confirmou os 11 titulares.');saveGame(false);window.renderLineup();toast('Escalação salva.');};
window.FGLineup={swap:swapWithBench,selectSlot,autoPick,compat};
function css(){const s=document.createElement('style');s.textContent=`#lineup .card>.row{flex-wrap:wrap}.fgPitch{position:relative!important;min-height:650px!important;width:min(100%,620px)!important;margin:16px 0!important;background:linear-gradient(#1f7a3d,#166632)!important;border:4px solid #ffffffaa!important;border-radius:18px!important;overflow:hidden!important}.fgPitch:before{content:'';position:absolute;inset:4%;border:2px solid #ffffff88;border-radius:4px}.fgPitch:after{content:'';position:absolute;left:35%;top:43%;width:30%;aspect-ratio:1;border:2px solid #ffffff88;border-radius:50%}.fgMid{position:absolute;left:4%;right:4%;top:50%;border-top:2px solid #ffffff88}.fgPlayer{position:absolute;transform:translate(-50%,-50%);width:118px;min-height:62px;border:2px solid #dce7df;background:#0c2416;color:#fff;border-radius:12px;padding:6px;z-index:3;cursor:pointer;box-shadow:0 5px 12px #0006}.fgPlayer small,.fgPlayer em{display:block;font-size:10px;color:#a9c5b2;font-style:normal}.fgPlayer b{display:block;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fgPlayer.bad{background:#5a4810;border-color:#ffd84a}.fgPlayer.bad span{display:block;font-size:8px;color:#ffe57d;font-weight:800}.fgPlayer.selected{outline:3px solid #56e58b;transform:translate(-50%,-50%) scale(1.06)}.fgPlayer.susp{opacity:.45}.fgBenchHead{display:flex;justify-content:space-between;gap:12px;margin-bottom:8px}.fgBenchList{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px}.fgBenchPlayer{display:flex;flex-direction:column;align-items:flex-start;text-align:left;background:#102218;border:1px solid #31543b;color:#fff;border-radius:10px;padding:9px;cursor:pointer}.fgBenchPlayer:hover{border-color:#56e58b}.fgBenchPlayer span{font-size:11px;color:#9fbaa7}.fgBenchPlayer em{font-size:10px;color:#ff9b9b}.fgBenchPlayer.susp{opacity:.45}.fgSubRule{margin-top:10px;padding:10px;border:1px dashed #5d6b61;border-radius:9px;color:#c9d8ce}@media(min-width:980px){#lineup .card{position:relative}#lineup #pitch{width:62%!important;display:inline-block!important;vertical-align:top}#lineup h3:has(+ #bench){position:absolute;left:65%;top:86px}#lineup #bench{position:absolute;left:65%;right:18px;top:125px;max-height:650px;overflow:auto}#lineup #roles,#lineup #discipline,#lineup h3:not(:has(+ #bench)){clear:both}}@media(max-width:680px){.fgPitch{min-height:560px!important}.fgPlayer{width:96px;min-height:56px}.fgPlayer b{font-size:11px}}`;document.head.appendChild(s)}
css();setTimeout(()=>{init();const f=$('formation');if(f){f.onchange=()=>{G.lineupMeta.selectedSlot=null;autoPick()};const row=f.closest('.row');if(row&&!document.getElementById('fgAuto')){const b=document.createElement('button');b.id='fgAuto';b.className='btn';b.textContent='✨ Organizar time';b.onclick=autoPick;row.appendChild(b)}}window.renderLineup()},150);
})();