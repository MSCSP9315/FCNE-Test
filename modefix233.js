/* FC NE Trainingsapp — v2.33 TEST — Hallo/Feld isoliert, 23.10.2026
   Wird ausschliesslich durch test-halle-feld.html geladen.
   Die produktive index.html wird NICHT veraendert. */
(function(){
'use strict';
const VERSION='2.33 HALLE/FELD TEST';
const phases=typeof PHASES!=='undefined'?PHASES:['Aufwärmen','Vielseitigkeit','Fussball spielen lernen','Fussball spielen','Ausklang'];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const exerciseById=id=>DATA.find(e=>e.id===id);
function branch(e){
  if(!e)return null;
  try{return typeof fcneExerciseBranch==='function'?fcneExerciseBranch(e):e.fcneBranch;}
  catch(_){return e.fcneBranch||null;}
}
function mode(e){
  if(!e)return null;
  const id=String(e.id||'');
  if(id==='5gegen5-1gegen1')return 'field'; // Spezialfall PMF-Feldspielteil
  const builtIn=/^e2c-(\d{4})$/.exec(id);
  if(builtIn){
    const n=Number(builtIn[1]);
    if(n>=1&&n<=177)return n>=56&&n<=100?'hall':'field';
  }
  if(/^fcne-(halle|hall)-/.test(id))return 'hall';
  if(branch(e)!=='easy2coach')return null;
  const env=String(e.environment||'').toLowerCase();
  if(['hall','halle','indoor'].includes(env))return 'hall';
  if(['field','feld','outdoor'].includes(env))return 'field';
  const place=String(e.fcneTrainingPlaces||e.training_places||e.location||e.field||'').toLowerCase().trim();
  if(/^(halle|turnhalle|sporthalle|indoor|futsal)$/.test(place))return 'hall';
  if(/^(feld|rasen|kunstrasen|outdoor)$/.test(place))return 'field';
  if(/hallentraining|hallenfussball|hallenfußball|hallenparcours/.test(String(e.title||'').toLowerCase()))return 'hall';
  // Unbekannte Onlineuebungen sicherheitshalber nicht als Feld deklarieren.
  return null;
}
window.fcneExerciseMode=mode;
window.fcneIsHallExercise=e=>mode(e)==='hall';
window.fcneIsFieldExercise=e=>mode(e)==='field';
function allEasy(){
  return DATA.filter(e=>/^e2c-\d{4}$/.test(String(e.id||'')) || /^fcne-(halle|hall)-/.test(String(e.id||'')) || branch(e)==='easy2coach');
}
function pool(which){
  return allEasy().filter(e=>mode(e)===(which==='hall'?'hall':'field'));
}
window.fcneEasyModePool=pool;
function inWizard(){
  return !!document.getElementById('screen-wizard')?.classList.contains('active');
}
function selectedMode(){
  if(inWizard()&&typeof draft!=='undefined'&&draft?.sourceBranch==='easy2coach')
    return draft.environment==='hall'?'hall':'field';
  return window.FCNE_EASY_MODE==='hall'?'hall':'field';
}
const branchPoolBefore=window.fcneBranchPool;
window.fcneBranchPool=function(which){
  const explicit=arguments.length>0&&which!=null;
  const active=explicit?which:(inWizard()&&typeof draft!=='undefined'&&draft?.sourceBranch?draft.sourceBranch:window.FCNE_ACTIVE_BRANCH||'sfv');
  if(active!=='easy2coach')return typeof branchPoolBefore==='function'?branchPoolBefore.apply(this,arguments):DATA;
  const m=selectedMode();
  if(!explicit&&!inWizard()&&window.FCNE_EASY_MODE!=='hall'&&window.FCNE_EASY_MODE!=='field')
    return allEasy();
  let rows=pool(m);
  if(!explicit&&inWizard()){
    const fixed=typeof window.fcneFixedGameForMode==='function'?window.fcneFixedGameForMode(m):null;
    rows=rows.filter(e=>e.category!=='Fussball spielen');
    if(fixed)rows.push(fixed);
  }
  return rows;
};
const oldOpenMode=window.fcneOpenEasyMode;
if(typeof oldOpenMode==='function'){
  window.fcneOpenEasyMode=function(which){
    const m=which==='hall'?'hall':'field';
    window.FCNE_EASY_MODE=m;
    window.FCNE_ACTIVE_BRANCH='easy2coach';
    return oldOpenMode.call(this,m);
  };
}
const oldCompose=window.fcneBranchCompose;
if(typeof oldCompose==='function'){
  window.fcneBranchCompose=function(){
    if(window.FCNE_ACTIVE_BRANCH==='easy2coach'&&!pool(selectedMode()).length){
      alert('Für diese Trainingsart fehlen derzeit Übungen.');return;
    }
    return oldCompose.apply(this,arguments);
  };
}
const oldGenerateMenu=window.fcneBranchGenerate;
if(typeof oldGenerateMenu==='function'){
  window.fcneBranchGenerate=function(){
    if(window.FCNE_ACTIVE_BRANCH==='easy2coach'&&!pool(selectedMode()).length){
      alert('Für diese Trainingsart fehlen derzeit Übungen.');return;
    }
    return oldGenerateMenu.apply(this,arguments);
  };
}
function allowed(e,which,phase){
  return !!e&&mode(e)===which&&(!phase||e.category===phase);
}
function repair(plan){
  if(!plan||plan.sourceBranch!=='easy2coach')return [];
  const m=plan.environment==='hall'?'hall':'field',fixes=[];
  plan.environment=m;
  plan.selections=plan.selections||{};
  phases.forEach(ph=>{
    const id=plan.selections[ph];
    if(!id)return;
    if(allowed(exerciseById(id),m,ph))return;
    const fixed=ph==='Fussball spielen'&&typeof window.fcneFixedGameForMode==='function'
      ?window.fcneFixedGameForMode(m):null;
    const replacement=fixed||pool(m).find(e=>e.category===ph);
    if(replacement)plan.selections[ph]=replacement.id;
    else delete plan.selections[ph];
    fixes.push({phase:ph,removed:id,replacedWith:replacement?.id||null});
  });
  return fixes;
}
window.fcneRepairDraftMode233=()=>typeof draft==='undefined'?[]:repair(draft);
const originalGenerate=window.eplanAutoGenerate;
if(typeof originalGenerate==='function'){
  window.eplanAutoGenerate=async function(){
    const branchNow=window.FCNE_ACTIVE_BRANCH||'sfv';
    const requested=window.FCNE_EASY_MODE==='hall'?'hall':'field';
    const result=await originalGenerate.apply(this,arguments);
    if(branchNow==='easy2coach'&&typeof draft!=='undefined'&&draft?.sourceBranch==='easy2coach'){
      draft.environment=requested;
      repair(draft);
      if(typeof renderWizard==='function')renderWizard();
    }
    return result;
  };
}
const originalRender=window.renderWizard;
if(typeof originalRender==='function'){
  window.renderWizard=function(){
    try{window.fcneRepairDraftMode233();}catch(err){console.warn('FCNE mode repair:',err);}
    return originalRender.apply(this,arguments);
  };
}
const oldChoose=window.chooseExercise;
if(typeof oldChoose==='function'){
  window.chooseExercise=function(phase,id){
    if(typeof draft!=='undefined'&&draft?.sourceBranch==='easy2coach'&&!allowed(exerciseById(id),draft.environment==='hall'?'hall':'field',phase)){
      alert('Diese Übung gehört nicht zu deinem '+(draft.environment==='hall'?'Hallen':'Feld')+'training.');return;
    }
    return oldChoose.apply(this,arguments);
  };
}
const oldSelect=window.selectFromDetail;
if(typeof oldSelect==='function'){
  window.selectFromDetail=function(id){
    if(typeof draft!=='undefined'&&draft?.sourceBranch==='easy2coach'&&!allowed(exerciseById(id),draft.environment==='hall'?'hall':'field')){
      alert('Diese Übung gehört nicht zu deinem '+(draft.environment==='hall'?'Hallen':'Feld')+'training.');return;
    }
    return oldSelect.apply(this,arguments);
  };
}
window.fcneShowOther233=function(){
  document.querySelectorAll('#fcneV232Swap .fcne-v233-extra').forEach(x=>x.hidden=false);
  document.getElementById('fcneV233More')?.remove();
};
window.fcneSwapExercise=function(phase){
  if(typeof draft==='undefined'||!draft)return;
  const easy=draft.sourceBranch==='easy2coach';
  const m=draft.environment==='hall'?'hall':'field';
  const raw=easy?pool(m):(typeof branchPoolBefore==='function'?branchPoolBefore('sfv'):DATA);
  let rows=raw.filter(e=>e.category===phase&&e.id!==draft.selections?.[phase]);
  if(easy&&phase==='Fussball spielen'&&m==='hall'){
    const fixed=window.fcneFixedGameForMode?.('hall');
    rows=fixed&&fixed.id!==draft.selections?.[phase]?[fixed]:[];
  }
  if(typeof focusScore==='function'){
    rows.sort((a,b)=>focusScore(b,draft.focus)-focusScore(a,draft.focus)||String(a.title||'').localeCompare(String(b.title||''),'de'));
  }
  const card=(e,extra)=>'<div class="fcne-v232-alt '+(extra?'fcne-v233-extra':'')+'" '+(extra?'hidden':'')+'>'+
    (e.image?'<img src="'+esc(e.image)+'" alt="">':'')+
    '<div style="flex:1"><b>'+esc(e.title)+'</b><small>'+esc(e.focus||phase)+' · '+(Number(e.duration)||15)+' Min.'+(easy?' · '+(m==='hall'?'Halle':'Feld'):'')+'</small></div>'+
    '<button class="fcne-v232-action fcne-v232-own" onclick="fcneApplySwap(\''+esc(phase)+'\',\''+esc(e.id)+'\')">Übernehmen</button></div>';
  document.getElementById('fcneV232Swap')?.remove();
  const wrap=document.createElement('div');wrap.id='fcneV232Swap';wrap.className='fcne-v232-modal';
  wrap.innerHTML='<div class="fcne-v232-sheet"><h2>🔄 '+esc(phase)+' wechseln</h2>'+
    (easy?'<p><b>'+(m==='hall'?'🏟️ Nur Halle':'⚽ Nur Feld')+'</b> · feste Trennung</p>':'')+
    '<p>Nur diese Übung wird ersetzt. Weitere passende Übungen sind aufklappbar.</p>'+
    (rows.length?rows.slice(0,3).map(e=>card(e,false)).join(''):'<p>Keine weitere passende Übung vorhanden.</p>')+
    rows.slice(3).map(e=>card(e,true)).join('')+
    (rows.length>3?'<button class="ep-btn" id="fcneV233More" onclick="fcneShowOther233()">＋ Weitere passende Übungen ('+(rows.length-3)+')</button>':'')+
    '<div class="fcne-v232-footer"><button class="ep-btn" onclick="document.getElementById(\'fcneV232Swap\').remove()">Schliessen</button></div></div>';
  document.body.appendChild(wrap);
};
window.fcneApplySwap=function(phase,id){
  if(typeof draft==='undefined'||!draft)return;
  const e=exerciseById(id);
  if(!e||e.category!==phase)return;
  if(draft.sourceBranch==='easy2coach'&&!allowed(e,draft.environment==='hall'?'hall':'field',phase)){
    alert('Blockiert: Diese Übung gehört nicht zum ausgewählten Trainingsort.');return;
  }
  draft.selections=draft.selections||{};
  draft.selections[phase]=id;
  document.getElementById('fcneV232Swap')?.remove();
  if(typeof renderWizard==='function')renderWizard();
};
window.fcneModeAudit233=function(){
  const built=allEasy().filter(e=>/^e2c-\d{4}$/.test(String(e.id||''))&&Number(e.id.slice(4))<=177);
  const hall=built.filter(e=>mode(e)==='hall'),field=built.filter(e=>mode(e)==='field');
  return {version:VERSION,builtIn:built.length,hall:hall.length,field:field.length,expectedBuiltIn:177,expectedHall:45,expectedField:132,pass:built.length===177&&hall.length===45&&field.length===132,
    hallInField:pool('field').filter(e=>mode(e)==='hall').map(e=>e.id),
    fieldInHall:pool('hall').filter(e=>mode(e)==='field').map(e=>e.id),
    phaseHall:phases.map(phase=>({phase,count:pool('hall').filter(e=>e.category===phase).length}))};
};
window.FCNE_APP_VERSION=VERSION;
document.querySelectorAll('.app-version').forEach(el=>el.textContent='Version 2.33 TEST · Halle/Feld · 23.10.2026');
console.info('FC NE mode test',window.fcneModeAudit233());
})();
