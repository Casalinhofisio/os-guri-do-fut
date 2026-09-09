(()=>{
const REAL=new Set(['Internacional','Grêmio','Juventude','Caxias','Brasil-Pel','Pelotas','Aimoré','Passo Fundo','Ypiranga']);
const CLUB_POWER={'Internacional':88,'Grêmio':87,'Juventude':76,'Caxias':72,'Ypiranga':69,'São José':67,'São Luiz':66,'Avenida':65,'Guarany de Bagé':64,'Novo Hamburgo':64,'Inter-SM':63,'Monsoon':62,'Pelotas':57,'Brasil-Pel':56,'Passo Fundo':54,'Veranópolis':53,'Lajeadense':52,'Esportivo':51,'Aimoré':50,'Santa Cruz':49,'Bagé':48,'Glória':47,'Gaúcho':46,'Guarani-VA':45,'Gramadense':44,'União Frederiquense':43,'Brasil-FAR':42,'APAFUT':40,'São Paulo-RG':33,'Rio Grande':32,'Farroupilha':31,'Riograndense-RG':29,'Panambi':28,'Cruz Alta':27,'Futebol Com Vida':26,'Novo Horizonte':25,'Real Sport':24,'Clube 1992':23};
function clean(){if(!window.G)return;G.db=G.db||[];G.db=G.db.filter(p=>!REAL.has(p.c)||p.real);G.realRosterGuard=true}
const baseStrength=window.strength;window.strength=function(team,d){if(team===G.club)return Math.round(G.roster.reduce((a,x)=>a+x[2],0)/Math.max(1,G.roster.length));return CLUB_POWER[team]||(baseStrength?baseStrength(team,d):50)};
window.FGRealGuard={clean,realClubs:REAL};setTimeout(clean,700)
})();