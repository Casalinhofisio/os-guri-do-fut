(()=>{
let handled='';
const nativeConfirm=window.confirm.bind(window);
window.confirm=function(msg){if(String(msg)==='Fim de jogo. Voltar para a competição?')return true;return nativeConfirm(msg)};
function key(g){return [G.year,G.phase,G.division,G.round,g?.h,g?.a].join('|')}
function finishLeague(g){try{apply(G.division,g)}catch(e){}try{endRound()}catch(e){try{completeOtherGames()}catch(_){};G.round=(G.round||0)+1;try{saveGame(false);renderAll()}catch(_){}}}
function finishPlayoffs(){try{completeOtherGames()}catch(e){}try{advancePlayoffs()}catch(e){}try{saveGame(false);renderAll()}catch(e){}}
function watch(){if(!window.G||!document.getElementById('fgLive90'))return;let g=null;try{g=userGame()}catch(e){}if(!g||!g.played)return;let k=key(g);if(handled===k)return;handled=k;if(G.phase==='league')finishLeague(g);else if(G.phase==='playoffs')finishPlayoffs()}
setInterval(watch,120);
})();