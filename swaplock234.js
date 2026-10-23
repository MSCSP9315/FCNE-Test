/* FC NE v2.34: isolated swap-only Halle/Feld lock, 2026-10-23.
   Test only. The production FCNE/index.html remains unchanged. */
(function(){
'use strict';
const VERSION='2.34 HALLE/FELD WECHSEL TEST';
const isMode=m=>m==='hall'||m==='field';
const getExercise=id=>DATA.find(e=>e&&String(e.id)===String(id));
const eMode=e=>typeof window.fcneExerciseMode==='function'?window.fcneExerciseMode(e):null;
const safe=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const activeDraft=()=>typeof draft!=='undefined'?draft:null;

function planMode(p){
  if(!p)return null;
  if(isMode(p.fcneModeLock234))return p.fcneModeLock234;
  // Names created by the E2C generator are a more reliable indicator than old mutable UI state.
  const name=String(p.name||'').toLowerCase();
  if(/^\s*hallentraining\b/.test(name))return 'hall';
  if(/^\s*feldtraining\b/.test(name))return 'field';
  if(isMode(p.fcneModeLocked))return p.fcneModeLocked;
  if(isMode(p.fcneTrainingMode))return p.fcneTrainingMode;
  if(isMode(p.environment))return p.environment;
  const notes=String(p.notes||'').toLowerCase();
  if(/\beasy2coach\s+halle\b/.test(notes))return 'hall';
  if(/\beasy2coach\s+feld\b/.test(notes))return 'field';
  if(isMode(window.FCNE_EASY_MODE))return window.FCNE_EASY_MODE;
  return 'field';
}
function lock(p,m){
  if(!p||p.sourceBranch!=='easy2coach'||!isMode(m))return;
  p.fcneModeLock234=m;
  p.fcneTrainingMode=m;
  p.fcneModeLocked=m;
  p.environment=m;
}
window.fcneModeForTraining234=planMode;

// The explicit Halle/Feld selection is captured BEFORE the generator changes screens.
const prevOpen=window.fcneOpenEasyMode;
if(typeof prevOpen==='function'){
  window.fcneOpenEasyMode=function(m){
    const selected=m==='hall'?'hall':'field';
    window.FCNE_EASY_MODE=selected;
    window.FCNE_MODE_CHOSEN_234=selected;
    return prevOpen.apply(this,arguments);
  };
}
const prevGenerate=window.eplanAutoGenerate;
if(typeof prevGenerate==='function'){
  window.eplanAutoGenerate=async function(){
    const requested=isMode(window.FCNE_MODE_CHOSEN_234)?window.FCNE_MODE_CHOSEN_234:
      (window.FCNE_EASY_MODE==='hall'?'hall':'field');
    const result=await prevGenerate.apply(this,arguments);
    const p=activeDraft();
    if(p?.sourceBranch==='easy2coach'){
      lock(p,requested);
      if(typeof window.fcneRepairDraftMode233==='function')window.fcneRepairDraftMode233();
      if(typeof window.renderWizard==='function')window.renderWizard();
    }
    return result;
  };
}
const prevRender=window.renderWizard;
if(typeof prevRender==='function'){
  window.renderWizard=function(){
    const p=activeDraft();
    if(p?.sourceBranch==='easy2coach')lock(p,planMode(p));
    return prevRender.apply(this,arguments);
  };
}
const beforeSwap=window.fcneSwapExercise;
const beforeApply=window.fcneApplySwap;
let offered=new Set(), offeredPhase=null, offeredMode=null;

function alternatives(p,phase,m){
  const candidates=typeof window.fcneEasyModePool==='function'
    ?window.fcneEasyModePool(m):[];
  const current=String(p.selections?.[phase]||'');
  const a=candidates.filter(e=>e&&e.category===phase&&eMode(e)===m&&String(e.id)!==current);
  // Allow the specific field PMF or hall goalkeeper game only in its matching mode.
  if(phase==='Fussball spielen'&&typeof window.fcneFixedGameForMode==='function'){
    const f=window.fcneFixedGameForMode(m);
    if(f&&getExercise(f.id)&&eMode(f)===m&&String(f.id)!==current&&!a.some(x=>x.id===f.id))a.push(f);
  }
  if(typeof focusScore==='function'){
    try{a.sort((x,y)=>(focusScore(y,p.focus)-focusScore(x,p.focus))||
      String(x.title||'').localeCompare(String(y.title||''),'de'));}catch(_){}
  }
  return a;
}

window.fcneSwapExercise=function(phase){
  const p=activeDraft();if(!p)return;
  if(p.sourceBranch!=='easy2coach')return typeof beforeSwap==='function'
    ?beforeSwap.apply(this,arguments):undefined;
  const m=planMode(p);lock(p,m);
  const items=alternatives(p,phase,m);
  // Fail closed. A wrong-mode or unclassified item is never a fallback.
  const accepted=items.filter(e=>eMode(e)===m&&e.category===phase);
  offered=new Set(accepted.map(e=>String(e.id)));
  offeredPhase=phase;offeredMode=m;

  document.getElementById('fcneV232Swap')?.remove();
  const wrap=document.createElement('div');
  wrap.id='fcneV232Swap';wrap.className='fcne-v232-modal';
  const top=accepted.slice(0,3),more=accepted.slice(3);
  function card(e,extra){
    return '<div class="fcne-v232-alt'+(extra?' fcne-v234-extra':'')+'"'+(extra?' hidden':'')+'>'+
      (e.image?'<img src="'+safe(e.image)+'" alt="'+safe(e.title)+'">':'')+
      '<div style="flex:1"><b>'+safe(e.title)+'</b><small>'+
      safe(e.focus||phase)+' · '+(Number(e.duration)||15)+' Min. · '+(m==='hall'?'Halle':'Feld')+
      '</small></div><button type="button" class="fcne-v232-action fcne-v232-own" data-fcne-v234-swap="'+safe(e.id)+'">Übernehmen</button></div>';
  }
  wrap.innerHTML='<div class="fcne-v232-sheet">'+
    '<h2>🔄 '+safe(phase)+' wechseln</h2>'+
    '<p style="font-weight:800;color:#17633b">'+(m==='hall'?'🏟️ Nur Hallenübungen':'⚽ Nur Feldübungen')+
    ' · '+accepted.length+' geprüfte Alternativen · Test 2.34</p>'+
    '<p>Die drei passendsten Übungen stehen oben. Weitere Übungen kannst du aufklappen.</p>'+
    (top.length?top.map(x=>card(x,false)).join(''):
      '<p>Für diese Phase ist keine weitere passend klassifizierte Übung vorhanden.</p>')+
    more.map(x=>card(x,true)).join('')+
    (more.length?'<button type="button" class="ep-btn" data-fcne-v234-more>＋ Weitere passende Übungen ('+more.length+')</button>':'')+
    '<div class="fcne-v232-footer"><button type="button" class="ep-btn" data-fcne-v234-close>Schliessen</button></div></div>';
  wrap.addEventListener('click',event=>{
    const btn=event.target.closest('button');if(!btn)return;
    if(btn.hasAttribute('data-fcne-v234-swap'))window.fcneApplySwap(phase,btn.getAttribute('data-fcne-v234-swap'));
    else if(btn.hasAttribute('data-fcne-v234-more')){
      wrap.querySelectorAll('.fcne-v234-extra').forEach(e=>e.hidden=false);btn.remove();
    }else if(btn.hasAttribute('data-fcne-v234-close'))wrap.remove();
  });
  document.body.appendChild(wrap);
};

window.fcneApplySwap=function(phase,id){
  const p=activeDraft();if(!p)return;
  if(p.sourceBranch!=='easy2coach')return typeof beforeApply==='function'
    ?beforeApply.apply(this,arguments):undefined;
  const m=planMode(p),e=getExercise(id);
  if(!e||!offered.has(String(id))||offeredPhase!==phase||offeredMode!==m||
     e.category!==phase||eMode(e)!==m){
    alert('Diese Übung wurde blockiert: Sie gehört nicht zu den passenden '+(m==='hall'?'Hallen':'Feld')+'übungen.');
    return;
  }
  lock(p,m);
  p.selections=p.selections||{};p.selections[phase]=id;
  offered.clear();offeredPhase=null;offeredMode=null;
  document.getElementById('fcneV232Swap')?.remove();
  if(typeof window.renderWizard==='function')window.renderWizard();
};

window.fcneSwapAudit234=function(){
  const p=activeDraft(),m=p?.sourceBranch==='easy2coach'?planMode(p):null;
  const phases=typeof PHASES!=='undefined'?PHASES:[];
  const list=typeof window.fcneModeAudit233==='function'?window.fcneModeAudit233():null;
  return {version:VERSION,trainingMode:m,
    classification:list,
    swaps:phases.map(phase=>{
      const rows=m?alternatives(p,phase,m):[];
      return {phase,count:rows.length,wrongMode:rows.filter(e=>eMode(e)!==m).map(e=>e.id)};
    })};
};
window.FCNE_APP_VERSION=VERSION;
document.querySelectorAll('.app-version').forEach(e=>e.textContent='Version 2.34 TEST · Halle/Feld-Wechsel · 23.10.2026');
console.info('FCNE swap-lock test',window.fcneSwapAudit234());
})();