/* FC-NE v2.32 TEST. Only loaded by /FCNE-Test/test-halle-feld.html.
   Original v2.31 CLEAN and production repo are not modified. */
(function () {
  'use strict';
  const VERSION = 'v2.32 TEST – Halle/Feld';
  const PHASES232 = ['Aufwärmen','Vielseitigkeit','Fussball spielen lernen','Fussball spielen','Ausklang'];
  const esc232 = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const byId232 = id => DATA.find(e => String(e.id) === String(id));
  const modeValid232 = mode => mode === 'hall' || mode === 'field';
  const isE2C232 = e => e && ((typeof window.fcneExerciseBranch === 'function' && window.fcneExerciseBranch(e) === 'easy2coach') || /^e2c-\d{4}$/.test(String(e.id)) || /^fcne-hall-/.test(String(e.id)));
  function classify232(e) {
    if (!e) return null;
    const id = String(e.id || '');
    // Explicit, frozen mapping of the 177 original Easy2Coach catalogue records.
    const match = /^e2c-(\d{4})$/.exec(id);
    if (match) {
      const n = Number(match[1]);
      if (n >= 1 && n <= 177) return n >= 56 && n <= 100 ? 'hall' : 'field';
    }
    if (id === '5gegen5-1gegen1') return 'field'; // designated PMF field game
    if (/^fcne-hall-/.test(id)) return 'hall';
    if (!isE2C232(e)) return null;
    // Newly loaded records are accepted only when location is explicit.
    const environment = String(e.environment || '').toLowerCase().trim();
    if (/^(hall|halle|indoor)$/.test(environment)) return 'hall';
    if (/^(field|feld|outdoor)$/.test(environment)) return 'field';
    const place = String(e.fcneTrainingPlaces || e.training_places || e.location || '').toLowerCase().trim();
    if (/^(halle|turnhalle|sporthalle|indoor|futsal)$/.test(place)) return 'hall';
    if (/^(feld|rasen|kunstrasen|outdoor)$/.test(place)) return 'field';
    if (/hallentraining|hallenparcours|hallenfussball|hallenfußball/i.test(String(e.title || ''))) return 'hall';
    // Deliberately unknown: never infer "field" from "not hall".
    return null;
  }
  window.fcneExerciseMode232 = classify232;
  window.fcneIsHallExercise = e => classify232(e) === 'hall';
  window.fcneEasyModePool = function(mode) {
    if (!modeValid232(mode)) return [];
    return DATA.filter(e => isE2C232(e) && classify232(e) === mode);
  };
  function plan232(p) {
    if (p && p.sourceBranch === 'easy2coach' && modeValid232(p.environment)) return p.environment;
    if (p && p.sourceBranch === 'easy2coach' && /^hallentraining\b/i.test(String(p.name || ''))) return 'hall';
    if (p && p.sourceBranch === 'easy2coach' && /^feldtraining\b/i.test(String(p.name || ''))) return 'field';
    return modeValid232(window.FCNE_MODE_CHOSEN_232) ? window.FCNE_MODE_CHOSEN_232 :
           modeValid232(window.FCNE_EASY_MODE) ? window.FCNE_EASY_MODE : null;
  }
  const cur232 = () => typeof draft !== 'undefined' && draft ? draft : null;
  const prevPool232 = window.fcneBranchPool;
  window.fcneBranchPool = function(branch) {
    const explicit = arguments.length > 0 && branch != null;
    const d = cur232();
    const src = explicit ? branch : (d && d.sourceBranch) || window.FCNE_ACTIVE_BRANCH || 'sfv';
    if (src !== 'easy2coach') return prevPool232.apply(this, arguments);
    const mode = plan232(d && d.sourceBranch === 'easy2coach' ? d : null);
    if (!modeValid232(mode)) return [];
    let rows = window.fcneEasyModePool(mode);
    if (!explicit && d && d.sourceBranch === 'easy2coach') {
      rows = rows.filter(e => e.category !== 'Fussball spielen');
      const fixed = typeof window.fcneFixedGameForMode === 'function' ? window.fcneFixedGameForMode(mode) : null;
      if (fixed && classify232(fixed) === mode && !rows.some(e => e.id === fixed.id)) rows.push(fixed);
    }
    return rows;
  };
  const beforeMode232 = window.fcneOpenEasyMode;
  if (typeof beforeMode232 === 'function') {
    window.fcneOpenEasyMode = function(mode) {
      window.FCNE_MODE_CHOSEN_232 = mode === 'hall' ? 'hall' : 'field';
      window.FCNE_EASY_MODE = window.FCNE_MODE_CHOSEN_232;
      return beforeMode232.apply(this, arguments);
    };
  }
  function candidates232(p,phase) {
    const mode = plan232(p);
    if (!p || p.sourceBranch !== 'easy2coach' || !modeValid232(mode)) return [];
    if (phase === 'Fussball spielen') {
      const fixed = window.fcneFixedGameForMode && window.fcneFixedGameForMode(mode);
      return fixed && classify232(fixed) === mode && String(fixed.id) !== String(p.selections?.[phase]) ? [fixed] : [];
    }
    return window.fcneEasyModePool(mode).filter(e => e.category === phase && String(e.id) !== String(p.selections?.[phase]))
      .sort((a,b) => {
        const score = typeof focusScore === 'function' ? focusScore(b,p.focus)-focusScore(a,p.focus) : 0;
        return score || String(a.title || '').localeCompare(String(b.title || ''),'de');
      });
  }
  function repair232(p) {
    if (!p || p.sourceBranch !== 'easy2coach') return [];
    const mode = plan232(p);
    if (!modeValid232(mode)) return [];
    p.environment = mode;
    p.selections = p.selections || {};
    const changes = [];
    for (const phase of PHASES232) {
      const old = p.selections[phase];
      if (!old) continue;
      const e = byId232(old);
      if (e && e.category === phase && classify232(e) === mode &&
          (phase !== 'Fussball spielen' || e.id === window.fcneFixedGameForMode?.(mode)?.id)) continue;
      const replace = phase === 'Fussball spielen' ? window.fcneFixedGameForMode?.(mode)
        : window.fcneEasyModePool(mode).find(x => x.category === phase);
      if (replace && classify232(replace) === mode) p.selections[phase] = replace.id;
      else delete p.selections[phase];
      changes.push({phase,from:old,to:p.selections[phase] || null});
    }
    return changes;
  }
  const beforeGenerate232 = window.eplanAutoGenerate;
  if (typeof beforeGenerate232 === 'function') {
    window.eplanAutoGenerate = async function() {
      const branch = window.FCNE_ACTIVE_BRANCH;
      const mode = window.FCNE_EASY_MODE;
      // v2.32 test uses the verified local catalogue: do not trigger the
      // legacy 1,200-entry online-sync threshold on every generation.
      const sync232 = window.fcneSyncEasy2CoachCatalog;
      if (branch === 'easy2coach') window.fcneSyncEasy2CoachCatalog = async function(){return 0;};
      let result;
      try { result = await beforeGenerate232.apply(this,arguments); }
      finally { if (branch === 'easy2coach') window.fcneSyncEasy2CoachCatalog = sync232; }
      const p = cur232();
      if (branch === 'easy2coach' && p?.sourceBranch === 'easy2coach' && modeValid232(mode)) {
        p.environment = mode;
        repair232(p);
        if (typeof renderWizard === 'function') renderWizard();
      }
      return result;
    };
  }
  const beforeChoose232 = window.chooseExercise;
  if (typeof beforeChoose232 === 'function') {
    window.chooseExercise = function(phase,id) {
      const p = cur232();
      if (p?.sourceBranch === 'easy2coach') {
        const e = byId232(id), m = plan232(p);
        if (!e || e.category !== phase || classify232(e) !== m) {
          alert('Blockiert: Die Übung passt nicht zu Halle/Feld.'); return;
        }
      }
      return beforeChoose232.apply(this,arguments);
    };
  }
  const beforeSelect232 = window.selectFromDetail;
  if (typeof beforeSelect232 === 'function') {
    window.selectFromDetail = function(id) {
      const p = cur232();
      if (p?.sourceBranch === 'easy2coach') {
        const e = byId232(id);
        if (!e || classify232(e) !== plan232(p)) {alert('Diese Übung gehört zur falschen Trainingsart.');return;}
      }
      return beforeSelect232.apply(this,arguments);
    };
  }
  const style = document.createElement('style');
  style.textContent = '.fcne232badge{position:fixed;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:9998;background:#fff2cc;color:#513c00;border:1px solid #d99b1b;border-radius:20px;padding:7px 12px;font:800 12px system-ui;box-shadow:0 4px 20px #0003}.fcne232bar{margin:14px 0;padding:13px;background:#f4faf6;border:1px solid #a8dabb;border-radius:13px}.fcne232bar button{margin:5px 4px 0 0;padding:9px;border:1px solid #a9d6ba;background:#fff;border-radius:9px;font-weight:700;color:#124b2b}.fcne232shade{position:fixed;inset:0;z-index:10020;background:#0009;display:flex;align-items:center;justify-content:center;padding:12px}.fcne232sheet{background:#fff;color:#163b28;border-radius:18px;max-width:650px;width:100%;max-height:86vh;overflow:auto;padding:18px;box-sizing:border-box}.fcne232item{display:flex;gap:10px;align-items:center;border-bottom:1px solid #ddd;padding:10px 0}.fcne232item img{width:78px;height:65px;object-fit:contain;background:#f5f5f5}.fcne232item div{flex:1;min-width:0}.fcne232item button{border:0;padding:10px;border-radius:10px;background:#12854b;color:white;font-weight:700}.fcne232item small{display:block;color:#647c6b}';
  document.head.appendChild(style);
  let offered232 = new Set(), phase232 = null, mode232 = null;
  window.fcneSwapExercise232 = function(phase) {
    const p = cur232();
    if (!p || p.sourceBranch !== 'easy2coach') return;
    const mode = plan232(p);
    const options = candidates232(p,phase);
    offered232 = new Set(options.map(e => String(e.id)));
    phase232 = phase; mode232 = mode;
    document.getElementById('fcne232modal')?.remove();
    const outer = document.createElement('div');
    outer.id = 'fcne232modal'; outer.className = 'fcne232shade';
    const items = options.map(e => '<div class="fcne232item">'+(e.image?'<img loading="lazy" src="'+esc232(e.image)+'" alt="">':'')+'<div><b>'+esc232(e.title)+'</b><small>'+esc232(e.focus || phase)+' · '+(mode === 'hall'?'Halle':'Feld')+'</small></div><button type="button" data-fcne232="'+esc232(e.id)+'">Übernehmen</button></div>').join('');
    outer.innerHTML = '<div class="fcne232sheet"><h2>🔄 '+esc232(phase)+' wechseln</h2><p><b>'+(mode === 'hall'?'🏟️ Nur Hallenübungen':'⚽ Nur Feldübungen')+'</b> · '+options.length+' passende Alternativen</p>'+(items || '<p>Keine weitere passende Übung vorhanden.</p>')+'<p><button data-fcne232close type="button">Schliessen</button></p></div>';
    outer.addEventListener('click',event => {
      if (event.target === outer || event.target.closest('[data-fcne232close]')) {outer.remove();return;}
      const button = event.target.closest('[data-fcne232]');
      if (!button) return;
      const id = button.getAttribute('data-fcne232');
      const e = byId232(id);
      if (!offered232.has(id) || mode232 !== plan232(p) || phase232 !== phase ||
          !e || e.category !== phase || classify232(e) !== mode232) {
        alert('Falsche Trainingsart: Übung wurde nicht übernommen.');return;
      }
      p.selections[phase] = id;
      outer.remove(); offered232.clear();
      if (typeof renderWizard === 'function') renderWizard();
    });
    document.body.appendChild(outer);
  };
  const beforeRender232 = window.renderWizard;
  if (typeof beforeRender232 === 'function') {
    window.renderWizard = function() {
      const p = cur232();
      if (p?.sourceBranch === 'easy2coach') repair232(p);
      const result = beforeRender232.apply(this,arguments);
      if (p?.sourceBranch === 'easy2coach' && typeof wizardStep !== 'undefined' &&
          typeof STEPS !== 'undefined' && wizardStep === STEPS.length-1) {
        const body = document.getElementById('wizardBody');
        if (body && !body.querySelector('.fcne232bar')) {
          const div = document.createElement('div');
          div.className = 'fcne232bar';
          div.innerHTML = '<b>🔄 Einzelne Übung wechseln · '+(plan232(p) === 'hall'?'Halle':'Feld')+'</b><div>'+
            PHASES232.map((phase,i) => '<button type="button" data-phase232="'+i+'">'+esc232(phase)+'</button>').join('')+'</div>';
          div.addEventListener('click',e => {
            const button = e.target.closest('[data-phase232]');
            if (button) window.fcneSwapExercise232(PHASES232[Number(button.getAttribute('data-phase232'))]);
          });
          body.prepend(div);
        }
      }
      return result;
    };
  }
  window.fcneAudit232 = function() {
    const built = DATA.filter(e => /^e2c-\d{4}$/.test(String(e.id)) && Number(e.id.slice(4)) <= 177);
    const hall = built.filter(e => classify232(e) === 'hall').length;
    const field = built.filter(e => classify232(e) === 'field').length;
    const rows = PHASES232.map(phase => ({
      phase, hall:window.fcneEasyModePool('hall').filter(e => e.category === phase).length,
      field:window.fcneEasyModePool('field').filter(e => e.category === phase).length
    }));
    const leaks = ['hall','field'].flatMap(mode =>
      window.fcneEasyModePool(mode).filter(e => classify232(e) !== mode).map(e => e.id));
    return {version:VERSION,originalCount:built.length,originalHall:hall,originalField:field,unknown:DATA.filter(e => isE2C232(e) && !classify232(e)).length,leaks,rows,pass:built.length === 177 && hall === 45 && field === 132 && !leaks.length};
  };
  window.FCNE_APP_VERSION = VERSION;
  const badge = document.createElement('div');
  badge.className = 'fcne232badge';
  badge.textContent = '🧪 v2.32 TEST · Halle/Feld';
  document.body.appendChild(badge);
  document.querySelectorAll('.app-version').forEach(el => el.textContent = 'Version 2.32 TEST · Halle/Feld · 23.10.2026');
  console.info('[FCNE v2.32 TEST]',window.fcneAudit232());
})();