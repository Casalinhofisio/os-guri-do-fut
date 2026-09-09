(()=>{
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
  const ensureMeta=()=>{if(!window.G)return null;G.balance=G.balance||{version:1,form:[],matches:0};return G.balance};
  function userFormBoost(){const b=ensureMeta();if(!b||!b.form.length)return 0;const pts=b.form.slice(-5).reduce((s,r)=>s+(r==='W'?3:r==='D'?1:0),0);return clamp((pts-7)/3,-2.2,2.2)}
  function lineupPower(){try{if(!G.lineup?.length)return strength(G.club,G.division);const vals=G.lineup.map(n=>G.roster.find(p=>p[0]===n)?.[2]).filter(Number.isFinite);return vals.length>=7?avg(vals):strength(G.club,G.division)}catch{return strength(G.club,G.division)}}
  function power(team,d,g){let p=team===G.club?lineupPower():strength(team,d);if(team===g.h)p+=1.8;if(team===G.club){p+=(clamp(G.confidence||68,35,90)-65)/9;p+=userFormBoost();let m=G.mentality||G.tactic||'';if(/ofens|press/i.test(m))p+=1;if(/defens/i.test(m))p-=.4}return p}
  window.simulateGoal=function(d,g){
    if(g.played)return;
    if(g._swing==null)g._swing=(Math.random()+Math.random()+Math.random()-1.5)*5.2;
    let hp=power(g.h,d,g)+g._swing,ap=power(g.a,d,g)-g._swing;
    const diff=clamp((hp-ap)/14,-2.2,2.2);
    let hc=.034+diff*.0105,ac=.034-diff*.0105;
    if(g.hg>g.ag){hc*=.88;ac*=1.10}else if(g.ag>g.hg){ac*=.88;hc*=1.10}
    const total=g.hg+g.ag;if(total>=5){hc*=.72;ac*=.72}
    hc=clamp(hc,.009,.060);ac=clamp(ac,.009,.060);
    if(Math.random()<hc)g.hg++;
    if(Math.random()<ac)g.ag++;
  };
  function recordResult(){try{const g=userGame();if(!g||!g.played||g._recordedBalance)return;g._recordedBalance=true;const us=g.h===G.club?g.hg:g.ag,them=g.h===G.club?g.ag:g.hg;const b=ensureMeta();b.form.push(us>them?'W':us===them?'D':'L');b.form=b.form.slice(-8);b.matches++;if(b.form.length>=3){const last=b.form.slice(-3).join('');if(last==='WWW')addNews('🔥 Embalou!',`${G.club} chegou a três vitórias seguidas. A torcida já começa a sonhar.`);if(last==='LLL')addNews('⚠️ Pressão no Professor',`São três derrotas seguidas. A próxima rodada ganhou peso no vestiário.`)}const gd=us-them;if(gd>=3)addNews('Atuação de gala',`${G.club} venceu com autoridade. Moral do grupo em alta.`);if(gd<=-3)addNews('Noite para esquecer',`Derrota pesada. O elenco vai precisar de resposta rápida.`);saveGame(false)}catch(e){console.warn('balance record',e)}}
  const oldRender=window.renderAll;
  if(typeof oldRender==='function')window.renderAll=function(){recordResult();oldRender();try{const g=userGame();if(g&&!g.played){const d=G.division,us=power(G.club,d,g),opp=g.h===G.club?g.a:g.h,op=power(opp,d,g),delta=us-op;const tag=delta>7?'Tu chega como favorito':delta<-7?'Jogo bem complicado':Math.abs(delta)<3?'Confronto equilibrado':'Dá jogo';const el=document.getElementById('matchRound');if(el&&!el.textContent.includes('• '+tag))el.textContent+=' • '+tag}}catch{}};
  const rebind=()=>{const a=document.getElementById('playRound'),b=document.getElementById('instantRound');if(a&&typeof window.playRound==='function')a.onclick=()=>window.playRound(true);if(b&&typeof window.playRound==='function')b.onclick=()=>window.playRound(false)};
  setTimeout(()=>{ensureMeta();rebind();if(typeof window.renderAll==='function')window.renderAll()},0);
})();