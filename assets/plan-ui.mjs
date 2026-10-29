import {escape as e,money,path,itemPath} from './view.mjs';
import {buildPlan,normalizeState,encodeState,decodeState} from './planner.mjs';
import {renderPlan,planMarkdown,printPlan} from './plan-view.mjs';

const questions=[
  {name:'stage',title:'Where are you now?',help:'A general setup answer never assumes stock burn-in is complete.',options:[['not-arrived','My U1 hasn’t arrived'],['stock','Stock and assembled'],['mods','I have some mods'],['paxx12','Paxx12 is already installed']]},
  {name:'materials',title:'What do you want to print?',help:'This branch selects material prerequisites and relevant community options.',options:[['basic','PLA, PETG or TPU'],['abs','I’m curious about ABS or ASA'],['abrasive','Abrasive filaments, such as CF or GF'],['colors','Five or more colors']]},
  {name:'enclosure',title:'What enclosure do you have?',help:'An existing lid can satisfy an enclosure prerequisite. It does not establish safe temperatures or ventilation.',options:[['none','No enclosure'],['diy','A DIY lid'],['official','Official Top Cover'],['other','Another enclosure']]},
  {name:'budget',title:'What’s your next-month budget?',help:'Prices come from the catalog. Anything that does not fit stays visible as a deferral.',options:[[0,'$0 — free options'],[50,'About $50'],[150,'About $150'],[300,'About $300 or more']]},
  {name:'bothers',title:'What would you most like to improve?',help:'Choose up to two. You can leave this blank.',multiple:true,options:[['noise','Noise'],['fumes','Fumes'],['reliability','Reliability'],['speed-flow','Speed or flow'],['color-count','Color options'],['dry-filament','Dry filament']]},
  {name:'comfort',title:'How much tinkering suits you?',help:'Firmware and soldering restrictions also apply to prerequisites. Already-installed firmware can still expose its settings.',options:[['basic','No firmware changes or soldering'],['firmware','Firmware changes are OK'],['soldering','Firmware and soldering are OK']]},
  {name:'location',title:'Where does your U1 live?',help:'Location boosts relevant noise and fume options; it is not a ventilation assessment.',options:[['living-space','A desk in a living space'],['office','An office'],['garage-workshop','A garage or workshop']]}
];
const mounts=new WeakMap();

export function mountPlanner(main,items,phases,base,data){
  mounts.get(main)?.abort();const controller=new AbortController();mounts.set(main,controller);
  document.body.classList.remove('print-preview');
  const decoded=decodeState(location.hash,items);
  let state=decoded.state,plan,showing=decoded.shared,hashWritten=location.hash;
  const reviewed=new Set(decoded.shared?questions.map((_,index)=>index):[]);
  main.innerHTML=`<div class="planner-screen"><header class="page-heading"><p class="intro-label">Follow your next step</p><h1>What’s next for your U1?</h1><p class="lead">Start where you are. Follow a few choices to community projects, with costs, prerequisites and a reason for each recommendation.</p></header>
    <div id="hash-notice" class="callout caution" ${decoded.valid?'hidden':''}>This plan link is invalid or uses an unsupported version. We’ve loaded the default answers.</div>
    <div class="planner-layout"><div id="decision-intake"><div class="decision-intro"><p>Seven questions. Every one is skippable.</p><div><button type="button" class="text-button" id="use-defaults">Show my plan with these answers</button><button type="button" class="text-button" id="show-questions">See all questions</button></div></div>
    <form id="planner-form" aria-label="Your U1 decision path"><ol class="decision-path">${questions.map((question,index)=>`<li ${index&&!decoded.shared?'hidden':''}><details class="planner-question" id="question-${index}" ${index===0&&!decoded.shared?'open':''}><summary><span class="phase-number">${index+1}</span><span><strong>${e(question.title)}</strong><small data-answer="${e(question.name)}"></small></span><span class="disclosure" aria-hidden="true">+</span></summary><fieldset aria-describedby="help-${index}"><legend class="visually-hidden">${e(question.title)}</legend><p class="small" id="help-${index}">${e(question.help)}</p><div class="answer-options">${question.options.map(([value,text])=>`<label class="answer-option"><input type="${question.multiple?'checkbox':'radio'}" name="${e(question.name)}" value="${e(value)}" ${question.multiple?state.bothers.includes(value)?'checked':'':String(state[question.name])===String(value)?'checked':''}><span>${e(text)}</span></label>`).join('')}</div><div class="question-actions"><button type="button" class="button primary" data-next-question="${index}">${index===questions.length-1?'Build my plan':'Continue'}</button><button type="button" class="text-button" data-skip-question="${index}">Skip with current answer</button></div></fieldset></details></li>`).join('')}</ol></form>
    <p id="question-status" class="small" role="status" aria-live="polite"></p><div class="planner-restart"><button type="button" class="text-button" data-action="restart">Start over</button><p class="small">Answers live in this page’s URL. Your startup-track progress stays separate.</p></div></div>
    <aside class="direction-panel" aria-labelledby="direction-heading"><p class="intro-label">Your current direction</p><h2 id="direction-heading">Community options that fit</h2><div id="direction-preview"></div><p class="small">A preview of the route, not an instruction to install. Open the full plan for prerequisites, warnings and everything deferred.</p></aside></div>
    <section id="plan-results" ${showing?'':'hidden'} aria-labelledby="result-heading"></section><p id="plan-announcement" role="status" aria-live="polite" class="visually-hidden"></p></div>
    <section id="plan-print" class="plan-print" hidden></section>`;
  const form=document.querySelector('#planner-form'),results=document.querySelector('#plan-results');
  const questionStatus=document.querySelector('#question-status');
  document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();main.scrollIntoView({block:'start'});main.focus();},{signal:controller.signal});
  function saveHash(){hashWritten=encodeState(state,items);history.replaceState(null,'',`${location.pathname}${location.search}${hashWritten}`);}
  function scrollTo(target){if(target.tabIndex<0)target.tabIndex=-1;target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});target.focus({preventScroll:true});}
  function summaries(){for(const question of questions){const value=state[question.name];document.querySelector(`[data-answer="${question.name}"]`).textContent=question.multiple?question.options.filter(([option])=>value.includes(option)).map(([,text])=>text).join(', ')||'No concern selected':question.options.find(([option])=>String(option)===String(value))?.[1]||'';}}
  function compute(){
    try{
      plan=buildPlan(items,state);state=plan.state;summaries();
      const preview=[...plan.steps].filter(step=>step.item.phase>=3).sort((a,b)=>b.score-a.score||a.number-b.number).slice(0,3);
      document.querySelector('#direction-preview').innerHTML=`<p>${e(plan.strategy)}</p><ul>${preview.map(step=>`<li><a href="${e(itemPath(base,step.item.id))}">${e(step.item.title)}</a><small>${e(money(step.item.cost_usd))} / ${e(step.item.source.creator||'Creator credit pending')}</small></li>`).join('')}</ul><p class="small">${plan.steps.length} steps fit. ${plan.deferred.length} deferred by budget. ${plan.quotes.length} need a quote.</p>`;
      if(showing){results.hidden=false;results.innerHTML=renderPlan(plan,base,data);document.querySelector('#share-link').value=new URL(`${path(base,'plan/')}${encodeState(state,items)}`).href;}
      document.querySelector('#plan-announcement').textContent=`Plan updated: ${plan.steps.length} steps, ${money(plan.total_cost)} planned, ${plan.deferred.length} deferred by budget.`;
    }catch(error){
      results.hidden=false;results.innerHTML='<div class="callout caution" role="alert"><h2 id="result-heading" tabindex="-1">The plan cannot be built safely</h2><p>The catalog has an unresolved dependency or capability problem. Please report it through the project’s GitHub page.</p></div>';document.querySelector('#direction-preview').textContent='No partial plan is shown while its dependencies are unresolved.';plan=null;
    }
  }
  function revealResult(){showing=true;saveHash();compute();scrollTo(document.querySelector('#result-heading'));}
  function advance(index){reviewed.add(index);const details=document.querySelector(`#question-${index}`);details.open=false;
    if(index===questions.length-1){revealResult();return;}
    const next=document.querySelector(`#question-${index+1}`);next.parentElement.hidden=false;next.open=true;saveHash();questionStatus.textContent=`Question ${index+2} of ${questions.length}. Earlier answers can still be changed.`;scrollTo(next.querySelector('summary'));
  }
  form.addEventListener('submit',event=>event.preventDefault());
  form.addEventListener('change',event=>{
    if(event.target.name==='bothers'&&form.querySelectorAll('[name="bothers"]:checked').length>2){event.target.checked=false;questionStatus.textContent='Choose up to two concerns. Clear one before adding another.';return;}
    const values=new FormData(form),answers={};for(const question of questions)answers[question.name]=question.multiple?values.getAll(question.name):values.get(question.name);
    state=normalizeState({...state,...answers},items);saveHash();compute();questionStatus.textContent='Your route has been updated. You can continue or change an earlier answer.';
  });
  form.addEventListener('click',event=>{const button=event.target.closest('[data-next-question],[data-skip-question]');if(button)advance(Number(button.dataset.nextQuestion??button.dataset.skipQuestion));});
  document.querySelector('#use-defaults').addEventListener('click',()=>{document.querySelectorAll('.decision-path>li').forEach(li=>li.hidden=false);revealResult();});
  document.querySelector('#show-questions').addEventListener('click',()=>{document.querySelectorAll('.decision-path>li').forEach(li=>li.hidden=false);questionStatus.textContent='All seven questions are available. Open any question to change its answer.';});
  async function copy(text,message){
    try{await navigator.clipboard.writeText(text);document.querySelector('#export-status').textContent=message;}
    catch{document.querySelector('#export-status').textContent='Automatic copy is unavailable. Select and copy the text below.';document.querySelector('#copy-fallback-wrap').hidden=false;const area=document.querySelector('#copy-fallback');area.value=text;area.focus();area.select();}
  }
  main.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    const edit=button.dataset;
    if(edit.owned||edit.unown||edit.add||edit.remove){
      if(edit.owned)state.owned.push(edit.owned);
      if(edit.unown)state.owned=state.owned.filter(id=>id!==edit.unown);
      if(edit.add)state.selected.push(edit.add);
      if(edit.remove)state.selected=state.selected.filter(id=>id!==edit.remove);
      state=normalizeState(state,items);saveHash();compute();scrollTo(document.querySelector('#result-heading'));return;
    }
    if(edit.action==='restart'){state=normalizeState({},items);showing=false;history.replaceState(null,'',`${location.pathname}${location.search}`);mountPlanner(main,items,phases,base,data);scrollTo(document.querySelector('#question-0 summary'));return;}
    if(!plan)return;
    if(edit.action==='markdown')copy(planMarkdown(plan,base,data),'Shopping list, print queue and full guidance copied.');
    if(edit.action==='share')copy(document.querySelector('#share-link').value,'Plan link copied.');
    if(edit.action==='print'){document.querySelector('#plan-print').innerHTML=printPlan(plan,base,data);document.querySelector('#plan-print').hidden=false;document.body.classList.add('print-preview');scrollTo(document.querySelector('#plan-print h1'));}
    if(edit.action==='browser-print')window.print();
    if(edit.action==='back'){document.body.classList.remove('print-preview');document.querySelector('#plan-print').hidden=true;scrollTo(document.querySelector('#result-heading'));}
  },{signal:controller.signal});
  // Replace the listener on restart instead of accumulating stale planner instances.
  window.onhashchange=()=>{if(location.hash!==hashWritten)mountPlanner(main,items,phases,base,data);};
  window.onbeforeprint=()=>{if(plan){document.querySelector('#plan-print').innerHTML=printPlan(plan,base,data);document.querySelector('#plan-print').hidden=false;}};
  window.onafterprint=()=>{if(!document.body.classList.contains('print-preview'))document.querySelector('#plan-print').hidden=true;};
  compute();
}
