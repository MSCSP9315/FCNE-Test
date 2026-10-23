/* FC-NE v2.32 TEST: SFV E/FF-11 hall game, 4v4 incl. goalkeeper.
   Only for the hall branch. Production v2.31 and field mode unchanged.
   Source: SFV Brack play more football, Hallenturniere, pages 17-22 (2026). */
(function(){
'use strict';
const OLD='fcne-halle-6v6-tw', ID='fcne-halle-4v4-tw';
if(typeof DATA==='undefined')return;
const game=DATA.find(x=>x&&x.id===ID)||DATA.find(x=>x&&x.id===OLD);
if(!game){console.warn('FCNE hall 4v4: source exercise missing');return;}
const ix=DATA.indexOf(game);
const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560" width="900" height="560" role="img" aria-label="Hallenfussball 4 gegen 4 mit Torhüter, je drei Feldspieler und ein Torhüter">'+
'<rect width="900" height="560" rx="24" fill="#eee6d8"/>'+
'<rect x="55" y="53" width="790" height="454" rx="9" fill="#cc9666" stroke="#f7f0e5" stroke-width="6"/>'+
'<g stroke="#f9f6ee" stroke-width="5" fill="none"><path d="M450 53V507"/><circle cx="450" cy="280" r="62"/><path d="M55 172H185V388H55M845 172H715V388H845"/></g>'+
'<g fill="#fff" stroke="#34495e" stroke-width="5"><rect x="27" y="233" width="28" height="94"/><rect x="845" y="233" width="28" height="94"/></g>'+
'<g fill="#155cc1" stroke="#fff" stroke-width="5"><circle cx="99" cy="280" r="22"/><circle cx="286" cy="175" r="21"/><circle cx="337" cy="280" r="21"/><circle cx="286" cy="385" r="21"/></g>'+
'<g fill="#d6363f" stroke="#fff" stroke-width="5"><circle cx="801" cy="280" r="22"/><circle cx="614" cy="175" r="21"/><circle cx="563" cy="280" r="21"/><circle cx="614" cy="385" r="21"/></g>'+
'<circle cx="450" cy="280" r="12" fill="#fff" stroke="#222" stroke-width="3"/>'+
'<text x="450" y="35" text-anchor="middle" fill="#51351e" font-family="Arial,sans-serif" font-size="24" font-weight="bold">E-Junioren · Halle · 4 gegen 4 inklusive Torhüter</text>'+
'<text x="450" y="540" text-anchor="middle" fill="#51351e" font-family="Arial,sans-serif" font-size="18">3 Feldspieler + 1 Torhüter pro Team · SFV Hallenformat 2026</text></svg>';
const img='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
Object.assign(game,{
 id:ID,title:'Hallenfussball – 4 gegen 4 mit Torhüter',
 category:'Fussball spielen',duration:20,field:'Halle',focus:'Spielformen',
 intro:'Freies Hallenspiel 4 gegen 4 inklusive Torhüter (3 Feldspieler + 1 Torhüter je Mannschaft). Altersgerechter Spielteil für E-Junioren, orientiert an den SFV-Hallenformaten 2026.',
 sections:[
  ['Organisation','Zwei Teams zu je 4 Kindern: 3 Feldspieler und 1 Torhüter. Hallenfeld, zwei Handballtore (3 × 2 m), Überzieher in zwei Farben und Futsal- oder Hallenbälle. Ersatzspieler regelmässig einwechseln.'],
  ['Ablauf','Freies Spiel 4 gegen 4. Möglichst wenig Unterbrechungen, kurze Spielsequenzen und regelmässige Wechsel. Auf Wunsch bei genügend Platz und Kindern: 5 gegen 5 als SFV-Variante für grössere Hallen.'],
  ['Coaching','Viele Ballkontakte, schnell umschalten, miteinander kombinieren, Räume nutzen und mutig 1 gegen 1 spielen. Torhüter aktiv ins Aufbauspiel einbinden.'],
  ['Quelle','Schweizerischer Fussballverband, Brack play more football: Hallenturniere im Kinderfussball (E/FF-11), Ausgabe 2026.']
 ],
 source_provider:'Alternative / FC NE',source_label:'FC NE – Hallenstandard nach SFV 2026',
 source_note:'Nur Easy2Coach-Hallenzweig. SFV: Einfachhalle 4 vs. 4 inkl. Torhüter; in grösseren Hallen auch 5 vs. 5 möglich.',
 source_url:'https://www.football.ch/portaldata/27/Resources/dokumente/kinderfussball/play_more_football/dokumente_de/7_hallenturniere/Brack_play_more_football_-_Broschuere_digital_futsal_DE.pdf?v=1778646032',
 fcneBranch:'easy2coach',environment:'hall',fcneTrainingPlaces:'Halle',
 players:'8',level:'E-Junioren',materials:['Bälle','Leibchen','2 Hallentore'],
 coaching:['Viele Ballkontakte','Schnell umschalten','Torhüter aktiv einbinden'],
 image:img,images:[img]
});
// Remove stale original record if both IDs are present.
for(let i=DATA.length-1;i>=0;i--)if(DATA[i]!==game&&DATA[i]?.id===OLD)DATA.splice(i,1);
const section=document.getElementById('detail-'+ix);
if(section){
 const escaped=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 section.innerHTML='<div class="detail-header"><button class="round-back" onclick="closeExercise()">‹</button>'+
 '<div class="detail-title"><strong>'+escaped(game.title)+'</strong><small>SFV-Hallenformat E-Junioren · Fussball spielen</small></div>'+
 '<button class="heart" data-id="'+ID+'" onclick="toggleFavorite(\''+ID+'\')">♡</button></div>'+
 '<div class="detail-content"><div class="detail-meta"><span class="big-badge" style="background:#7add8b">🥅 Fussball spielen</span></div>'+
 '<img class="detail-hero" src="'+img+'" alt="Hallenfussball 4 gegen 4 inklusive Torhüter" onclick="openZoom(this.src)">'+
 '<div class="facts"><div><b>20 Min</b><small>Dauer</small></div><div><b>4 vs 4</b><small>3+1 je Team</small></div>'+
 '<div><b>Halle</b><small>Trainingsort</small></div></div>'+
 '<div class="v22-coaching"><div class="v22-coaching-title">📋 Organisation</div><ul>'+
 '<li>3 Feldspieler + 1 Torhüter pro Team</li><li>2 Hallentore, Überzieher, Bälle</li><li>Kurze Spielrunden und regelmässige Wechsel</li></ul></div>'+
 '<div class="v22-coaching"><div class="v22-coaching-title">🎯 Coaching</div><ul>'+
 '<li>Viele Ballkontakte, schnell kombinieren</li><li>Torhüter ins Spiel einbinden</li><li>Alle Kinder aktiv beschäftigen</li></ul></div>'+
 '<div class="detail-actions"><button class="primary" onclick="selectFromDetail(\''+ID+'\')">✓ Für Training wählen</button></div></div>';
}
// Change exactly the hall fixed-game supplier; field delegates unchanged.
const previousFixed=window.fcneFixedGameForMode;
window.fcneFixedGameForMode=function(mode){
 if(mode==='hall')return game;
 return typeof previousFixed==='function'?previousFixed.apply(this,arguments):null;
};
function migrate(p){
 if(!p||p.sourceBranch!=='easy2coach'||p.environment!=='hall')return false;
 if(!p.selections||p.selections['Fussball spielen']===ID)return false;
 p.selections['Fussball spielen']=ID;
 p.customDurations=p.customDurations||{};
 if(p.customDurations[OLD]&&!p.customDurations[ID])p.customDurations[ID]=p.customDurations[OLD];
 delete p.customDurations[OLD];
 return true;
}
try{
 if(typeof saved!=='undefined'&&Array.isArray(saved)){
  let change=false;
  saved.forEach(p=>{if(migrate(p))change=true;});
  if(change)localStorage.setItem('fcne_saved_trainings_v07',JSON.stringify(saved));
 }
}catch(e){console.warn('FCNE saved hall game migration:',e);}
try{
 if(typeof draft!=='undefined'&&migrate(draft)&&typeof renderWizard==='function')renderWizard();
 if(typeof trainerCurrent!=='undefined'&&migrate(trainerCurrent)&&
    document.getElementById('trainerOverlay')?.classList.contains('open')&&
    typeof window.renderTrainerView==='function')window.renderTrainerView(trainerCurrent);
}catch(e){console.warn('FCNE hall trainer refresh:',e);}
window.FCNE_HALL_GAME_232={id:ID,format:'4 vs 4',keepers:2,playersPerTeam:4,source:'SFV 2026'};
console.info('FCNE v2.32 TEST hall game set to 4v4; field game unchanged.');
})();