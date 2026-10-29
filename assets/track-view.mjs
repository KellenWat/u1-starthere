import {escape as e,path,itemPath,date} from './view.mjs';

export function milestoneProgress(milestone,progress,phases){
  const steps=phases.flatMap(phase=>phase.steps),byId=new Map(steps.map(step=>[step.id,step])),needed=new Set();
  function include(id){if(needed.has(id))return;const step=byId.get(id);if(!step)throw new Error('Missing milestone step');needed.add(id);for(const parent of step.requires_steps||[])include(parent);}
  for(const id of milestone.step_ids)include(id);
  const required=steps.filter(step=>needed.has(step.id)),done=required.filter(step=>progress.steps[step.id]==='done').length;
  return {done,total:required.length,complete:done===required.length,next:required.find(step=>progress.steps[step.id]!=='done')};
}

export function renderMilestones(milestones,progress,phases){
  const states=milestones.map(milestone=>({milestone,state:milestoneProgress(milestone,progress,phases)})),active=states.findIndex(({state})=>!state.complete);
  return states.filter((_,index)=>active<0||index<=active).map(({milestone,state})=>`<section class="track-milestone"><h3>${e(milestone.title)}</h3><p>${state.done} of ${state.total} checks marked complete.</p>${state.complete?`<p>${e(milestone.complete_text)}</p>`:`<a href="#step-${e(state.next.id)}">Next unchecked check: ${e(state.next.text)}</a>`}</section>`).join('');
}

export function renderTrackStep(step,allSteps,items,base,open=false){
  const item=items.find(item=>item.id===step.item_id),guide=step.guidance,following=allSteps[allSteps.findIndex(candidate=>candidate.id===step.id)+1];
  return `<div class="track-step" id="step-${e(step.id)}" data-step="${e(step.id)}" role="group" aria-labelledby="step-label-${e(step.id)}"><div class="step-main"><input type="checkbox" id="${e(step.id)}" data-done="${e(step.id)}"><div class="step-copy"><label id="step-label-${e(step.id)}" for="${e(step.id)}">${e(step.text)}</label>
    ${guide?`<details class="step-guide" ${open?'open':''}><summary>How to do this</summary><div class="step-guide-body">${step.requires_steps?.length?`<p class="step-prerequisites"><strong>Before you start</strong> ${step.requires_steps.map(id=>`<a href="#step-${e(id)}">${e(allSteps.find(candidate=>candidate.id===id)?.text||id)}</a>`).join('')}</p>`:''}
    <a class="text-link step-walkthrough" href="${e(guide.sources[0].url.startsWith('https://')?guide.sources[0].url:'#')}">Open the official walkthrough</a>
    <ol>${guide.actions.map(action=>`<li>${e(action)}</li>`).join('')}</ol><p class="step-success"><strong>Done when</strong> ${e(guide.done_when)}</p><p class="step-stuck"><strong>If you get stuck</strong> ${e(guide.if_stuck)}</p>
    <ul class="step-sources">${guide.sources.map(source=>`<li><a href="${e(source.url.startsWith('https://')?source.url:'#')}">${e(source.note)}</a> <small>${e(source.creator)}</small></li>`).join('')}</ul><p class="small">Source reviewed ${e(date(guide.last_verified))}; not tested on a printer.</p><div class="step-help-links"><a href="${e(path(base,'fixes/'))}">Search fixes</a><a href="https://snapmaker.formcrafts.com/u1-troubleshooting-request">Official U1 support</a></div>
    ${following?`<a class="text-link step-next" href="#step-${e(following.id)}">Next check: ${e(following.text)}</a>`:''}</div></details>`:''}
    <div class="step-meta">${step.optional?'<span class="optional-label">Optional</span>':''}${item?`<a href="${e(itemPath(base,item.id))}">Related catalog guide: ${e(item.title)}</a>`:''}</div></div></div>${step.optional?`<button class="skip-step" type="button" data-skip="${e(step.id)}" aria-label="${e(`Skip optional step: ${step.text}`)}" aria-pressed="false">Skip</button>`:''}</div>`;
}
