import {escape as e,label,money,path,itemPath,itemCard,catalogItems} from './view.mjs';
import {STORAGE_KEY,readProgress,progressCounts} from './progress.mjs';
import {mountJourney} from './journey-ui.mjs';
import {mountFixes} from './fix-ui.mjs';

const base = new URL('../',import.meta.url).href;
const main = document.querySelector('#main');
const page = document.body.dataset.page;
const link = (route,text,cls='') => `<a class="${cls}" href="${e(path(base,route))}">${e(text)}</a>`;
const options = rows => rows.map(([value,text])=>`<option value="${e(value)}">${e(text)}</option>`).join('');
let items,phases;

async function load() {
  if (page === 'item') return; // Complete item content is pre-rendered from JSON.
  try {
    const names=['items','phases',...(['plan','fixes'].includes(page)?['fixes']:[]),...(page==='plan'?['journey']:[])];
    const docs = await Promise.all(names.map(async name => {
      const response = await fetch(path(base,`data/${name}.json`));
      if (!response.ok) throw new Error('Data unavailable');
      return response.json();
    }));
    items = docs[0].items; phases = docs[1].phases;
    if (!Array.isArray(items) || !Array.isArray(phases)) throw new Error('Invalid data');
    if (page === 'home') home();
    if (page === 'catalog') catalog();
    if (page === 'start') track();
    if (page === 'plan') mountJourney(main,items,phases,base,docs[0],docs[2].fixes,docs[3]);
    if (page === 'fixes') mountFixes(main,docs[2].fixes,items,base);
  } catch {
    main.innerHTML = `<section class="empty-state"><h1>Your field guide couldn’t load</h1><p>Check your connection and try again. For a local preview, open the site through its HTTP address.</p><button type="button" class="button primary" id="retry">Try again</button></section>`;
    document.querySelector('#retry').addEventListener('click',()=>load());
  }
}

function home() {
  const highlights = ['printed-mod','firmware','slicer'].map(category =>
    items.find(item=>item.category===category)).filter(Boolean);
  main.innerHTML = `<section class="home-hero"><div class="hero-copy"><p class="intro-label">For your Snapmaker U1</p>
    <h1>A good first week starts stock.</h1><p class="lead">Get the basics right, find useful community projects, and make your next change with a reason.</p>
    <div class="hero-actions">${link('start/','I’m new — start the track','button primary')}${link('plan/','I have a U1 — plan my next steps','button secondary')}</div>
    <p class="quiet-note">Free to use. No accounts, affiliate links or tracking.</p></div>
    <aside class="week-preview" aria-labelledby="week-heading"><div class="preview-heading"><img src="${e(path(base,'assets/app-icon.svg'))}" width="44" height="44" alt=""><h2 id="week-heading">Give your U1 a good start</h2></div>
    <ol>${phases.slice(0,3).map(phase=>`<li><span class="phase-number">${phase.phase+1}</span><div><h3>${e(phase.name)}</h3><p>${e(phase.goal)}</p></div></li>`).join('')}</ol>
    ${link('start/','See the full startup track','text-link')}</aside></section>
    <section class="home-section"><div class="section-heading"><div><h2>Good places to begin</h2><p>Useful community options, with the source always attached.</p></div>${link('catalog/','Browse the catalog','text-link')}</div>
    <div class="catalog-grid">${highlights.map(item=>itemCard(item,phases,base)).join('')}</div></section>
    <section class="next-section"><div><h2>“What should I do next?”</h2><p>Follow connected choices to a matching guide, the next useful question, or community projects that fit. See the order, costs and reasons, including anything your budget defers.</p><p class="small">Ask what matters. Keep every source attached.</p></div>${link('plan/','Find my next steps','button secondary')}</section>
    <section class="support-section"><h2>Something isn’t working?</h2><form class="home-fix-search" action="${e(path(base,'fixes/'))}" role="search"><label for="home-symptom">Describe the symptom</label><div><input id="home-symptom" type="search" name="q" placeholder="For example: prime tower keeps falling over"><button class="button primary" type="submit">Find a guide</button></div></form><p class="small">Keep your printer stock while investigating a new-machine fault.</p>${link('fixes/','Browse all fix cards','text-link')}</section>`;
}

function catalog() {
  const categories = [...new Set(items.map(item=>item.category))].sort();
  main.innerHTML = `<header class="page-heading"><p class="intro-label">Community projects and practical setup</p><h1>The U1 catalog</h1><p class="lead">Find a useful next step. Check the prerequisites, cost notes and creator’s guide before making a change.</p></header>
    <form class="filters" id="catalog-filters" role="search" aria-label="Filter the catalog"><div class="search-control"><label for="catalog-query">Find an item</label><input id="catalog-query" name="q" type="search" placeholder="Try a material, project or creator" autocomplete="off"></div>
    <div><label for="category">Category</label><select id="category" name="category">${options([['','All categories'],...categories.map(value=>[value,label(value)])])}</select></div>
    <div><label for="cost">Cost</label><select id="cost" name="cost">${options([['','Any cost'],['0','Free options'],['50','Up to $50'],['150','Up to $150'],['300','Up to $300'],['variable','Price varies']])}</select></div>
    <div><label for="difficulty">Difficulty</label><select id="difficulty" name="difficulty">${options([['','Any difficulty'],['1','1 — Easy'],['2','Up to 2 — Some setup'],['3','Up to 3 — Hands-on'],['4','Up to 4 — Advanced'],['5','Up to 5 — Experimental']])}</select></div>
    <div><label for="phase">Earliest stage</label><select id="phase" name="phase">${options([['','Any stage'],...phases.map(phase=>[String(phase.phase),phase.name])])}</select></div>
    <button type="reset" class="button quiet">Clear filters</button></form>
    <div class="results-heading"><p id="results-count" role="status" aria-live="polite"></p><p class="small">Ordered by earliest stage, then title</p></div><div class="catalog-grid" id="catalog-results"></div>
    <p class="catalog-note">Free means no purchase price; filament and optional hardware can still cost money. All times are estimates. Open an item for its price date, source and limitations.</p>`;
  const form = document.querySelector('#catalog-filters');
  const params = new URL(location.href).searchParams;
  for (const control of form.elements) {
    if (!control.name || !params.has(control.name)) continue;
    const value = params.get(control.name);
    if (control.type === 'search' || [...control.options].some(option=>option.value===value)) control.value=value;
  }
  function update() {
    const filters = Object.fromEntries(new FormData(form));
    const selected = catalogItems(items,filters);
    document.querySelector('#results-count').textContent = `${selected.length} of ${items.length} items`;
    document.querySelector('#catalog-results').innerHTML = selected.length ? selected.map(item=>itemCard(item,phases,base)).join('') :
      '<div class="empty-state"><h2>No items match these filters</h2><p>Try a broader category, cost or stage.</p><button class="button secondary" type="button" id="empty-reset">Clear filters</button></div>';
    document.querySelector('#empty-reset')?.addEventListener('click',()=>form.reset());
    const url = new URL(location.href); url.search='';
    for (const [key,value] of Object.entries(filters)) if(value) url.searchParams.set(key,value);
    history.replaceState(null,'',url);
  }
  form.addEventListener('submit',event=>event.preventDefault());
  form.addEventListener('input',update);
  form.addEventListener('reset',()=>{setTimeout(update,0);});
  update();
}

function track() {
  const allSteps = phases.flatMap(phase=>phase.steps);
  let saved, persistent=true;
  try { saved=localStorage.getItem(STORAGE_KEY); } catch { persistent=false; }
  let progress = readProgress(saved,phases);
  const firstIncomplete = phases.find(phase=>progressCounts(progress,phase.steps).finished<phase.steps.length)?.phase ?? phases[0].phase;
  const hashPhase = /^#phase-(\d+)$/.exec(location.hash)?.[1];
  const openPhase = hashPhase!==undefined && phases.some(phase=>phase.phase===Number(hashPhase)) ? Number(hashPhase) : firstIncomplete;
  main.innerHTML = `<header class="page-heading track-heading"><p class="intro-label">Your first week, at your pace</p><h1>The startup track</h1><p class="lead">Stock first, mods second. Get a clean baseline before changing the printer, then choose what’s useful to you.</p></header>
    <section class="progress-panel" aria-labelledby="progress-heading"><div><h2 id="progress-heading">Your progress</h2><p id="progress-text" role="status" aria-live="polite"></p></div><progress id="track-progress" value="0" max="${allSteps.length}" aria-label="Startup track progress"></progress><p class="small" id="storage-note">Saved only in this browser. Optional steps can be skipped.</p></section>
    <nav class="phase-nav" aria-label="Track stages">${phases.map(phase=>`<a href="#phase-${phase.phase}">${e(phase.name)}</a>`).join('')}</nav>
    <div class="track-phases">${phases.map(phase=>`<details class="track-phase" id="phase-${phase.phase}" ${phase.phase===openPhase?'open':''}><summary><span class="phase-number">${phase.phase+1}</span><span class="phase-title">${e(phase.name)}<small>${e(phase.goal)}</small></span><span class="phase-status" data-phase-status="${phase.phase}"></span><span class="disclosure" aria-hidden="true">+</span></summary>
      <div class="phase-body">${phase.steps.map(step=>{const item=items.find(item=>item.id===step.item_id);return `<div class="track-step" data-step="${e(step.id)}"><div class="step-main"><input type="checkbox" id="${e(step.id)}" data-done="${e(step.id)}"><div><label for="${e(step.id)}">${e(step.text)}</label><div class="step-meta">${step.optional?'<span class="optional-label">Optional</span>':''}${item?`<a href="${e(itemPath(base,item.id))}">Details: ${e(item.title)}</a>`:''}</div></div></div>${step.optional?`<button class="skip-step" type="button" data-skip="${e(step.id)}" aria-label="${e(`Skip optional step: ${step.text}`)}" aria-pressed="false">Skip</button>`:''}</div>`;}).join('')}
      ${phase.phase<phases.at(-1).phase?`<button class="button secondary next-phase" type="button" data-next="${phase.phase+1}">Continue to ${e(phases.find(p=>p.phase===phase.phase+1)?.name || '')}</button>`:''}</div></details>`).join('')}</div>
    <section class="completion" id="track-completion" hidden><h2>Track reviewed. Keep your baseline.</h2><p id="completion-text"></p>${link('catalog/','Explore the community catalog','button primary')}</section>
    <div class="track-bottom"><p class="small">Checking a box records your progress. It doesn’t verify a repair, firmware version or printer configuration.</p><button type="button" class="text-button" id="open-reset">Reset track progress</button></div>
    <dialog id="reset-dialog" aria-labelledby="reset-title"><form method="dialog"><h2 id="reset-title">Reset this track?</h2><p>This clears your saved checks and skipped steps in this browser.</p><div class="dialog-actions"><button class="button secondary" value="cancel" autofocus>Keep progress</button><button class="button primary" value="reset">Reset progress</button></div></form></dialog>`;
  function update() {
    const counts = progressCounts(progress,allSteps);
    document.querySelector('#progress-text').textContent = `${counts.finished} of ${counts.total} steps finished${counts.skipped?` (${counts.skipped} optional skipped)`:''}`;
    document.querySelector('#track-progress').value = counts.finished;
    document.querySelector('#storage-note').textContent = persistent ? 'Saved only in this browser. Optional steps can be skipped.' : 'Progress lasts for this visit only. This browser is blocking saved progress.';
    for(const phase of phases){
      const count = progressCounts(progress,phase.steps);
      document.querySelector(`[data-phase-status="${phase.phase}"]`).textContent = count.finished===count.total ? 'Finished' : `${count.finished}/${count.total}`;
      for(const step of phase.steps){
        const value = progress.steps[step.id];
        document.querySelector(`[data-done="${step.id}"]`).checked = value==='done';
        const row = document.querySelector(`[data-step="${step.id}"]`);
        row.classList.toggle('step-done',value==='done');row.classList.toggle('step-skipped',value==='skipped');
        const skip = document.querySelector(`[data-skip="${step.id}"]`);
        if(skip){skip.textContent=value==='skipped'?'Unskip':'Skip';skip.setAttribute('aria-pressed',String(value==='skipped'));skip.setAttribute('aria-label',`${value==='skipped'?'Unskip':'Skip optional step'}: ${step.text}`);}
      }
    }
    document.querySelector('#track-completion').hidden = counts.finished!==counts.total;
    document.querySelector('#completion-text').textContent = `You completed ${counts.done} steps and skipped ${counts.skipped} optional steps. Return any time to revisit your choices or add a new change.`;
  }
  function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));}catch{persistent=false;}update();}
  main.addEventListener('change',event=>{
    const id=event.target.dataset.done;if(!id)return;
    if(event.target.checked)progress.steps[id]='done';else delete progress.steps[id];save();
  });
  main.addEventListener('click',event=>{
    const skip=event.target.closest('[data-skip]');if(skip){const id=skip.dataset.skip;if(progress.steps[id]==='skipped')delete progress.steps[id];else progress.steps[id]='skipped';save();}
    const next=event.target.closest('[data-next]');if(next){const target=document.querySelector(`#phase-${next.dataset.next}`);target.open=true;target.querySelector('summary').focus();target.scrollIntoView({block:'start'});}
  });
  document.querySelectorAll('.phase-nav a').forEach(anchor=>anchor.addEventListener('click',()=>{const target=document.querySelector(anchor.hash);if(target)target.open=true;}));
  const dialog=document.querySelector('#reset-dialog');
  document.querySelector('#open-reset').addEventListener('click',()=>{dialog.returnValue='cancel';dialog.showModal();});
  dialog.addEventListener('close',()=>{if(dialog.returnValue==='reset'){progress={version:1,steps:{}};try{localStorage.removeItem(STORAGE_KEY);}catch{persistent=false;}update();}document.querySelector('#open-reset').focus();});
  window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY){progress=readProgress(event.newValue,phases);update();}});
  update();
  if(hashPhase!==undefined)document.querySelector(`#phase-${openPhase}`)?.scrollIntoView({block:'start'});
}

load();
