/* FCNE v2.32 TEST: visible Wechseln buttons. Does not touch production. */
(function(){
'use strict';
const phases=['Aufwärmen','Vielseitigkeit','Fussball spielen lernen','Fussball spielen','Ausklang'];
const enc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const planMode=p=>{
 if(!p||p.sourceBranch!=='easy2coach')return null;
 if(p.environment==='hall'||p.environment==='field')return p.environment;
 if(/^\s*hallentraining\b/i.test(String(p.name||'')))return 'hall';
 if(/^\s*feldtraining\b/i.test(String(p.name||'')))return 'field';
 return ['hall','field'].includes(window.FCNE_MODE_CHOSEN_232)?window.FCNE_MODE_CHOSEN_232:
        ['hall','field'].includes(window.FCNE_EASY_MODE)?window.FCNE_EASY_MODE:null;
};
const sheetStyle=document.createElement('style');
sheetStyle.textContent=[
'.fcne232btn{display:flex!important;width:max-content;max-width:100%;box-sizing:border-box;align-items:center;justify-content:center;gap:7px;cursor:pointer;background:#eaf7ee!important;color:#11683d!important;border:1px solid #b8dfc8!important;border-radius:999px!important;padding:9px 14px!important;margin:8px 4px 4px auto!important;min-height:40px;font:700 13px/1.2 system-ui,-apple-system,sans-serif!important;letter-spacing:.1px;box-shadow:0 1px 3px rgba(13,87,48,.07);position:relative;z-index:3;transition:background .16s,border-color .16s,transform .16s,box-shadow .16s}',
'.fcne232btn svg{display:block;width:17px;height:17px;flex:none;stroke:currentColor;stroke-width:2.2;fill:none;stroke-linecap:round;stroke-linejoin:round}',
'.fcne232btn:hover{background:#d9f0e2!important;border-color:#80c99f!important;box-shadow:0 3px 9px rgba(13,87,48,.1)}',
'.fcne232btn:active{transform:scale(.97);background:#c7e8d3!important}',
'.fcne232btn:focus-visible{outline:3px solid #12854b!important;outline-offset:3px}',
'#trainerBody .fcne232btn{margin:9px 13px 12px auto!important}',
'@media(max-width:420px){.fcne232btn{font-size:12px!important;padding:8px 12px!important;min-height:40px}}',
'.fcne232shade2{position:fixed;inset:0;z-index:99999;background:#0009;display:flex;align-items:center;justify-content:center;padding:12px}',
'.fcne232panel2{width:100%;max-width:680px;max-height:90vh;overflow:auto;box-sizing:border-box;background:white;color:#183c28;padding:18px;border-radius:17px}',
'.fcne232alt2{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid #ddd}',
'.fcne232alt2 img{width:78px;height:64px;object-fit:contain;background:#f3f6f3}',
'.fcne232alt2 div{flex:1;min-width:0}.fcne232alt2 small{display:block;color:#687b6c}',
'.fcne232alt2 button,.fcne232panel2>button{border:0;border-radius:9px;padding:10px;background:#087d43;color:white;font-weight:800}',
'.fcne232alt2[hidden]{display:none!important}'
].join('');
document.head.appendChild(sheetStyle);
function choices(p,phase){
 const m=planMode(p);
 if(!m||typeof window.fcneEasyModePool!=='function')return [];
 if(phase==='Fussball spielen'){
   const fixed=typeof window.fcneFixedGameForMode==='function'?window.fcneFixedGameForMode(m):null;
   const games=m==='hall'&&typeof window.fcneHallGameOptions232==='function'
     ?window.fcneHallGameOptions232():(fixed?[fixed]:[]);
   return games.filter(e=>e&&window.fcneExerciseMode232(e)===m&&
     String(e.id)!==String(p.selections?.[phase]));
 }
 return window.fcneEasyModePool(m).filter(e=>e.category===phase&&
   window.fcneExerciseMode232(e)===m&&String(e.id)!==String(p.selections?.[phase]))
 .sort((a,b)=>{try{const d=typeof focusScore==='function'?focusScore(b,p.focus)-focusScore(a,p.focus):0;if(d)return d;}catch(e){}return String(a.title||'').localeCompare(String(b.title||''),'de');});
}
function swap(p,phase,isTrainer){
 const m=planMode(p);
 if(!m){alert('Trainingsart nicht eindeutig. Bitte Halle oder Feld auswählen.');return;}
 const candidates=choices(p,phase);
 document.getElementById('fcne232overlay2')?.remove();
 const overlay=document.createElement('div');overlay.id='fcne232overlay2';overlay.className='fcne232shade2';
 const cards=candidates.map((e,i)=>'<div class="fcne232alt2"'+(i>=3?' hidden':'')+'>'+
   (e.image?'<img loading="lazy" src="'+enc(e.image)+'" alt="">':'')+
   '<div><b>'+enc(e.title)+'</b><small>'+enc(e.focus||phase)+' · '+(m==='hall'?'Halle':'Feld')+'</small></div>'+
   '<button type="button" data-id="'+enc(e.id)+'">Übernehmen</button></div>').join('');
 overlay.innerHTML='<div class="fcne232panel2" role="dialog" aria-modal="true"><h2>🔄 '+enc(phase)+' wechseln</h2>'+
  '<p><b>'+(m==='hall'?'🏟️ Nur Halle':'⚽ Nur Feld')+'</b> · '+candidates.length+' Alternativen</p>'+
  cards+(candidates.length===0?'<p>Keine weitere freigegebene Übung in dieser Trainingsphase.</p>':'')+
  (candidates.length>3?'<button type="button" data-more>＋ Weitere '+(candidates.length-3)+' anzeigen</button>':'')+
  '<button type="button" data-close>Schliessen</button></div>';
 overlay.addEventListener('click',event=>{
  const btn=event.target.closest('button');
  if(event.target===overlay||btn?.hasAttribute('data-close')){overlay.remove();return;}
  if(btn?.hasAttribute('data-more')){overlay.querySelectorAll('.fcne232alt2').forEach(x=>x.hidden=false);btn.remove();return;}
  const id=btn?.getAttribute('data-id');if(!id)return;
  const item=candidates.find(x=>String(x.id)===id);
  if(!item||item.category!==phase||window.fcneExerciseMode232(item)!==planMode(p)){alert('Falsche Trainingsart – blockiert.');return;}
  p.selections=p.selections||{};p.selections[phase]=item.id;overlay.remove();
  if(isTrainer){
    p.total=phases.reduce((n,ph)=>{const x=DATA.find(y=>y.id===p.selections[ph]);return n+(x?(Number(p.customDurations?.[x.id])||Number(x.duration)||0):0);},0);
    if(typeof window.renderTrainerView==='function')window.renderTrainerView(p);
  }else if(typeof window.renderWizard==='function')window.renderWizard();
 });
 document.body.appendChild(overlay);
}
function buttons(selector,p,isTrainer){
 if(!p||p.sourceBranch!=='easy2coach')return;
 const rows=document.querySelectorAll(selector);
 rows.forEach((row,i)=>{
   if(i>=phases.length||row.querySelector('.fcne232btn'))return;
   const b=document.createElement('button');b.type='button';b.className='fcne232btn';b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M5.5 9a7 7 0 0 1 11.6-2L20 12"/><path d="M18.5 15a7 7 0 0 1-11.6 2L4 12"/></svg><span>Wechseln</span>';
   b.setAttribute('aria-label',phases[i]+' Übung wechseln');
   b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();swap(p,phases[i],isTrainer);});
   row.appendChild(b);
 });
}
function showWizard(){
 try{
  if(typeof wizardStep==='undefined'||typeof STEPS==='undefined'||wizardStep!==STEPS.length-1)return;
  if(typeof draft==='undefined'||draft?.sourceBranch!=='easy2coach')return;
  document.querySelectorAll('#wizardBody .fcne232bar').forEach(x=>x.remove());
  buttons('#wizardBody .finished-training .sequence-row',draft,false);
 }catch(e){console.warn('FCNE swap summary',e);}
}
const baseWizard=window.renderWizard;
if(typeof baseWizard==='function')window.renderWizard=function(){
 const result=baseWizard.apply(this,arguments);showWizard();return result;
};
const baseTrainer=window.renderTrainerView;
if(typeof baseTrainer==='function')window.renderTrainerView=function(p){
 const result=baseTrainer.apply(this,arguments);
 try{buttons('#trainerBody .trainer-exercise',p,true);}catch(e){console.warn('FCNE swap trainer',e);}
 return result;
};
showWizard();
if(typeof trainerCurrent!=='undefined'&&trainerCurrent&&document.getElementById('trainerOverlay')?.classList.contains('open')){
 buttons('#trainerBody .trainer-exercise',trainerCurrent,true);
}
window.fcneSwapButtons232Ready=true;
})();