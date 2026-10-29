import {money,path} from './view.mjs';
import {buildPlan,normalizeState,encodeState,decodeState} from './planner.mjs';
import {renderPlan,planMarkdown,printPlan} from './plan-view.mjs';

import {questions,renderDecisionNodes,toggleConcern} from './decision-flow.mjs';

const mounts=new WeakMap();

export function mountPlanner(main,items,phases,base,data){
  mounts.get(main)?.abort();const controller=new AbortController();mounts.set(main,controller);
  document.body.classList.remove('print-preview');
  const decoded=decodeState(location.hash,items);
  let state=decoded.state,plan,showing=decoded.shared,hashWritten=location.hash;
  main.innerHTML=`<div class="planner-screen node-flow">
    <div class="flow-toolbar"><h1>What’s next for your U1?</h1><div><button type="button" class="text-button" id="edit-answers" ${showing?'':'hidden'}>Edit answers</button><button type="button" class="text-button" id="use-defaults" ${showing?'hidden':''}>See my plan</button><button type="button" class="text-button" data-action="restart">Start over</button></div></div>
    <div id="hash-notice" class="callout caution" ${decoded.valid?'hidden':''}>This plan link is invalid or uses an unsupported version. We’ve loaded the default answers.</div>
    <div id="decision-intake" ${showing?'hidden':''}>${renderDecisionNodes(state)}</div>
    <p id="question-status" class="visually-hidden" role="status" aria-live="polite"></p>
    <section id="plan-results" ${showing?'':'hidden'} aria-labelledby="result-heading"></section><p id="plan-announcement" role="status" aria-live="polite" class="visually-hidden"></p></div>
    <section id="plan-print" class="plan-print" hidden></section>`;
  const intake=main.querySelector('#decision-intake'),results=main.querySelector('#plan-results');
  const questionStatus=main.querySelector('#question-status');
  document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();main.scrollIntoView({block:'start'});main.focus();},{signal:controller.signal});
  function saveHash(){hashWritten=encodeState(state,items);history.replaceState(null,'',`${location.pathname}${location.search}${hashWritten}`);}
  function scrollTo(target){target.tabIndex=-1;target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});target.focus({preventScroll:true});}
  function summaries(){for(const question of questions){
    const value=state[question.name];
    main.querySelector(`[data-answer="${question.name}"]`).textContent=question.multiple?question.options.filter(([option])=>value.includes(option)).map(([,text])=>text).join(', ')||'No concern selected':question.options.find(([option])=>String(option)===String(value))?.[1]||'';
    for(const button of main.querySelectorAll(`[data-question="${question.name}"]`))button.setAttribute('aria-pressed',String(question.multiple?value.includes(button.dataset.choice):String(value)===button.dataset.choice));
  }
    main.querySelector('[data-concern-count]').textContent=state.bothers.length?`with ${state.bothers.length} selected`:'without a concern';
  }
  function compute(){
    try{
      plan=buildPlan(items,state);state=plan.state;summaries();
      if(showing){results.hidden=false;results.innerHTML=renderPlan(plan,base,data);main.querySelector('#share-link').value=new URL(`${path(base,'plan/')}${encodeState(state,items)}`).href;}
      main.querySelector('#plan-announcement').textContent=`Plan updated: ${plan.steps.length} steps, ${money(plan.total_cost)} planned, ${plan.deferred.length} deferred by budget.`;
    }catch(error){
      results.hidden=false;results.innerHTML='<div class="callout caution" role="alert"><h2 id="result-heading" tabindex="-1">The plan cannot be built safely</h2><p>The catalog has an unresolved dependency or capability problem. Please report it through the project’s GitHub page.</p></div>';plan=null;
    }
  }
  function revealResult(){showing=true;saveHash();compute();main.querySelector('#edit-answers').hidden=false;main.querySelector('#use-defaults').hidden=true;scrollTo(main.querySelector('#result-heading'));}
  function revealQuestion(index){intake.hidden=false;const next=main.querySelector(`#question-${index}`);next.hidden=false;questionStatus.textContent=`Question ${index+1} of ${questions.length}. Earlier answers can still be changed.`;scrollTo(next);}
  function advance(index){saveHash();if(index===questions.length-1)revealResult();else revealQuestion(index+1);}
  intake.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.question){
      const name=button.dataset.question,question=questions.find(question=>question.name===name);
      if(question.multiple){
        const next=toggleConcern(state.bothers,button.dataset.choice);
        if(next===state.bothers){questionStatus.textContent='Choose up to two concerns. Clear one before adding another.';return;}
        state=normalizeState({...state,bothers:next},items);
      }else state=normalizeState({...state,[name]:button.dataset.choice},items);
      saveHash();compute();
      if(!question.multiple)advance(questions.indexOf(question));
      else questionStatus.textContent=`${state.bothers.length} of 2 concerns selected. Continue when ready.`;
    }
    if(button.dataset.nextQuestion!==undefined||button.dataset.skipQuestion!==undefined)advance(Number(button.dataset.nextQuestion??button.dataset.skipQuestion));
    if(button.dataset.back!==undefined)revealQuestion(Number(button.dataset.back));
  });
  main.querySelector('#use-defaults').addEventListener('click',revealResult);
  main.querySelector('#edit-answers').addEventListener('click',()=>revealQuestion(0));
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
    if(edit.action==='restart'){state=normalizeState({},items);showing=false;history.replaceState(null,'',`${location.pathname}${location.search}`);mountPlanner(main,items,phases,base,data);scrollTo(document.querySelector('#question-0'));return;}
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
