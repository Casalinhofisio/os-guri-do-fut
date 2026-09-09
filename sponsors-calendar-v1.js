(()=>{
const OFFERS={
 B:[
  {name:'Mercado Joice',monthly:38000,win:6000,draw:0},
  {name:'G.E.G Produções',monthly:20000,win:8000,draw:0},
  {name:'Fono Nath',monthly:15000,win:10000,draw:0}
 ],
 A2:[
  {name:'Osirnet',monthly:100000,win:20000,draw:0},
  {name:'Banrisul',monthly:80000,win:18000,draw:5000},
  {name:'Dolly',monthly:70000,win:22000,draw:10000}
 ],
 A1:[
  {name:'ACPO',monthly:240000,win:45000,draw:12000},
  {name:'Fruki',monthly:200000,win:52000,draw:18000},
  {name:'Corona',monthly:170000,win:60000,draw:25000}
 ]
};
const MONTHS=['Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
function ensure(){if(!window.G)return false;G.calendar=G.calendar||{season:G.year||2026,monthIndex:0,roundInMonth:0};G.sponsorPayments=G.sponsorPayments||{};return true}
function currentMonth(){ensure();return MONTHS[Math.min(MONTHS.length-1,G.calendar.monthIndex||0)]}
function pay(v,desc){if(!v)return;money(v,desc)}
function offers(){return OFFERS[G.division]||OFFERS.B}
function choose(i){if(!ensure())return;const s=offers()[i];if(!s)return;if(G.sponsor&&G.sponsor.name!==s.name&&!confirm(`Trocar ${G.sponsor.name} por ${s.name}?`))return;G.sponsor={...s,bonus:0,months:12,division:G.division,startYear:G.year};G.sponsorPayments={};addNews('Patrocínio',`${s.name} é o novo patrocinador do ${G.club}. ${fmt(s.monthly)}/mês • ${fmt(s.win)} por vitória${s.draw?` • ${fmt(s.draw)} por empate`:''}.`);saveGame(false);renderSponsors();renderFinance();toast('Patrocínio assinado!')}
function renderSponsors(){const host=document.getElementById('sponsorOptions');if(!host)return;host.innerHTML=offers().map((s,i)=>`<div class=item><b>${s.name}</b> • ${fmt(s.monthly)}/mês • <span class=moneyplus>${fmt(s.win)} por vitória</span>${s.draw?` • ${fmt(s.draw)} por empate`:''} <button class="btn ${G.sponsor?.name===s.name?'disabled':''}" onclick="FGSponsors.choose(${i})">${G.sponsor?.name===s.name?'Atual':'Assinar'}</button></div>`).join('');const cur=document.getElementById('currentSponsor');if(cur)cur.innerHTML=G.sponsor?`Atual: <b>${G.sponsor.name}</b> • ${fmt(G.sponsor.monthly)}/mês • ${fmt(G.sponsor.win||0)}/vitória${G.sponsor.draw?` • ${fmt(G.sponsor.draw)}/empate`:''}`:'Sem patrocinador. Escolhe uma proposta abaixo.'}
function monthPayment(){if(!ensure()||!G.sponsor)return;const key=`${G.year}-${G.calendar.monthIndex}-${G.sponsor.name}`;if(G.sponsorPayments[key])return;G.sponsorPayments[key]=1;pay(G.sponsor.monthly,`Patrocínio ${G.sponsor.name} — ${currentMonth()}/${G.year}`)}
function afterMatch(g){if(!ensure()||!g||g._sponsorPaid||!G.sponsor)return;g._sponsorPaid=true;const us=g.h===G.club?g.hg:g.ag,them=g.h===G.club?g.ag:g.hg;if(us>them)pay(G.sponsor.win||0,`Bônus por vitória — ${G.sponsor.name}`);else if(us===them)pay(G.sponsor.draw||0,`Bônus por empate — ${G.sponsor.name}`);G.calendar.roundInMonth=(G.calendar.roundInMonth||0)+1;if(G.calendar.roundInMonth>=4){G.calendar.roundInMonth=0;G.calendar.monthIndex=Math.min(MONTHS.length-1,(G.calendar.monthIndex||0)+1);monthPayment()}saveGame(false);renderCalendar()}
function renderCalendar(){if(!ensure())return;let box=document.getElementById('fgCalendar');if(!box){const target=document.getElementById('financeGrid')?.parentElement||document.getElementById('financeMini')?.parentElement;if(!target)return;box=document.createElement('div');box.id='fgCalendar';box.className='panel';target.appendChild(box)}const mi=G.calendar.monthIndex||0;box.innerHTML=`<h3>📅 Calendário financeiro • ${G.year}</h3><div class="fgMonths">${MONTHS.map((m,i)=>`<span class="${i===mi?'now':i<mi?'done':''}">${m}</span>`).join('')}</div><div class=mut>Mês atual: <b>${currentMonth()}</b> • rodada ${Math.min(4,(G.calendar.roundInMonth||0)+1)}/4. O patrocínio mensal entra a cada 4 datas. Bônus entra imediatamente após vitória/empate.</div>`}
function patch(){if(!ensure())return;window.sponsors=offers();window.renderSponsors=renderSponsors;const old=window.playRound;if(typeof old==='function'&&!window.__fgSponsorHook){window.playRound=function(){let g=userGame?.();let timer=setInterval(()=>{if(g?.played){clearInterval(timer);afterMatch(g)}},250);setTimeout(()=>clearInterval(timer),20000);return old.apply(this,arguments)};window.__fgSponsorHook=1}monthPayment();renderSponsors();renderCalendar();const st=document.createElement('style');st.textContent='#fgCalendar{margin-top:14px}.fgMonths{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 10px}.fgMonths span{padding:6px 9px;border-radius:8px;background:#182019;color:#9aa59b;font-size:12px}.fgMonths .done{background:#17321f;color:#7edb9c}.fgMonths .now{background:#d8a52b;color:#171004;font-weight:900}';document.head.appendChild(st)}
window.FGSponsors={choose,offers,afterMatch,renderCalendar};setTimeout(patch,1150);setInterval(()=>{if(window.G){renderCalendar();renderSponsors()}},2500)
})();