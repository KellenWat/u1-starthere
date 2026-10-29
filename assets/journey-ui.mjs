import {escape as e,path,itemPath,softwareCard,platformLabel,filterSoftware} from './view.mjs';
import {walkJourney,chooseJourney,encodeJourney,decodeJourney,edges} from './journey.mjs';
import {renderFix} from './fix-view.mjs';
import {mountPlanner,unmountPlanner} from './plan-ui.mjs';

export function mountJourney(main,items,phases,base,itemData,fixes,data){
  const decoded=decodeJourney(location.hash.startsWith('#plan=')?'':location.hash,data,items);
  let choices=decoded.choices,current,planner=false;
  const title=node=>node.kind==='fix'?fixes.find(card=>card.id===node.fix_id)?.title:node.title;
  main.innerHTML=`<div class="journey-shell"><header class="journey-toolbar"><h1>Find your next step.</h1><div><button type="button" class="text-button" data-map-open>View full map</button><button type="button" class="text-button" data-home>Start over</button></div></header><p class="callout caution" id="journey-notice" ${decoded.valid?'hidden':''}>That route link could not be restored. Choose a new starting point below.</p><div id="journey-scenes"></div><div id="journey-planner" hidden></div><p class="visually-hidden" id="journey-status" role="status" aria-live="polite"></p></div>
    <dialog class="journey-map" aria-labelledby="map-title"><header><div><h2 id="map-title">Every path is connected.</h2><p>Follow a connection to see where it leads. Shared questions appear once.</p></div><button type="button" class="button secondary" data-map-close>Close map</button></header><div class="map-grid">${data.nodes.map(node=>`<article class="map-node" id="map-${e(node.id)}" tabindex="-1"><p class="small">${e(node.kind==='fix'?'Community guide':node.kind==='question'?'Choose a direction':'Destination')}</p><h3>${e(title(node))}</h3>${node.kind==='fix'?`<a class="text-link" href="${e(path(base,'fixes/?card='+encodeURIComponent(node.fix_id)))}">Open this guide</a>`:''}${node.kind==='resources'?`<ul class="map-resources">${node.item_ids.map(id=>{const item=items.find(item=>item.id===id);return `<li><a href="${e(itemPath(base,id))}">${e(item.title)}</a></li>`;}).join('')}</ul>`:''}${edges(node).length?`<ul>${edges(node).map(edge=>`<li><button type="button" data-map-target="${e(edge.next)}"><span>${e(edge.label)}</span><small>↳ ${e(title(data.nodes.find(node=>node.id===edge.next)))}</small></button></li>`).join('')}</ul>`:`<p class="small">${node.kind==='plan'?'Your ordered, budgeted plan':node.kind==='track'?'Preparation and stock tests':node.kind==='search'?'Search all curated symptoms':'Official guides and support'}</p>`}</article>`).join('')}</div></dialog>`;
  const scenes=main.querySelector('#journey-scenes'),plannerMount=main.querySelector('#journey-planner'),dialog=main.querySelector('.journey-map');
  function focus(target){target.tabIndex=-1;target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});target.focus({preventScroll:true});}
  function save(){history.replaceState(null,'',location.pathname+location.search+encodeJourney(choices));}
  function startPlanner(extra={}){
    const shared=location.hash.startsWith('#plan=');
    planner=true;scenes.hidden=true;plannerMount.hidden=false;
    for(const card of main.querySelectorAll('.map-node')){card.classList.toggle('is-current',card.id==='map-plan');card.setAttribute('aria-current',card.id==='map-plan'?'step':'false');}
    mountPlanner(plannerMount,items,phases,base,itemData,{initialState:location.hash.startsWith('#plan=')?undefined:current?.state,answered:current?.answered,onRestart:()=>{choices=[];save();draw(true);},...extra});
    window.onhashchange=restore;
    if(!shared)focus(plannerMount.querySelector('.decision-node:not([hidden])')||plannerMount);
  }
  function draw(scroll=false){
    unmountPlanner(plannerMount);
    document.body.classList.remove('print-preview');window.onbeforeprint=null;window.onafterprint=null;
    current=walkJourney(data,choices,items);planner=false;scenes.hidden=false;plannerMount.hidden=true;
    const {node,trail}=current;
    for(const card of main.querySelectorAll('.map-node')){card.classList.toggle('is-on-route',trail.some(entry=>`map-${entry.node.id}`===card.id));card.classList.toggle('is-current',card.id===`map-${node.id}`);card.setAttribute('aria-current',card.id===`map-${node.id}`?'step':'false');}
    const past=trail.map(({node,edge},index)=>`<section class="journey-visited"><button type="button" data-trail="${index}"><span>${e(title(node))}</span><strong>${e(edge.label)}</strong></button></section>`).join('');
    let content='';
    if(node.kind==='question')content=`<div class="journey-decision"><p class="journey-help">${e(node.help)}</p><h2 id="journey-title">${e(node.title)}</h2><div class="journey-options" role="group" aria-labelledby="journey-title">${node.choices.map(edge=>`<button type="button" class="journey-choice" data-edge="${e(edge.id)}"><span>${e(edge.label)}</span>${edge.description?`<small>${e(edge.description)}</small>`:''}<span class="branch-dot" aria-hidden="true"></span></button>`).join('')}</div></div>`;
    if(node.kind==='fix'){
      const card=fixes.find(card=>card.id===node.fix_id);
      content=`<div class="journey-guide"><p class="intro-label">A guide matches this observation</p>${renderFix(card,items,base)}<div class="guide-actions"><button type="button" class="button primary" data-edge="next">What’s next?</button>${card.related_items.length?'<button type="button" class="button secondary" data-related>Plan related improvements</button>':''}<button type="button" class="text-button" data-still>Still happening</button><button type="button" class="text-button" data-helped>That helped</button></div><p class="small">A matching guide is a starting point, not a confirmed diagnosis.</p></div>`;
    }
    if(node.kind==='resources'){
      const options=node.item_ids.map(id=>items.find(item=>item.id===id)),platforms=[...new Set(options.flatMap(item=>item.software?.platforms||[]))].sort();
      content=`<div class="journey-resources"><header><h2 id="journey-title">${e(node.title)}</h2><p class="lead">${e(node.help)}</p></header><div class="software-filter"><div><label for="software-platform">Runs on</label><select id="software-platform"><option value="">Any platform</option>${platforms.map(value=>`<option value="${e(value)}">${e(platformLabel(value))}</option>`).join('')}</select></div><p id="software-count" role="status" aria-live="polite">${options.length} options</p><a href="${e(path(base,'catalog/?category=software'))}">All software guides</a></div><div class="software-grid" id="software-results">${options.map(item=>softwareCard(item,base)).join('')}</div><button type="button" class="button secondary" data-edge="next">Explore another software goal</button></div>`;
    }
    if(node.kind==='track'){
      const step=node.step_id?phases.flatMap(phase=>phase.steps).find(step=>step.id===node.step_id):null;
      content=`<div class="journey-decision"><h2 id="journey-title">${e(node.title)}</h2><p class="journey-help">${node.help?e(node.help):step?e(step.text):'Preparation, inspection and stock tests come before modifications. Pick up the guided track at your own pace.'}</p><a class="button primary" href="${e(path(base,'start/'+(step?'#step-'+encodeURIComponent(step.id):'')))}">${step?'Open this check':'Open the startup track'}</a><button type="button" class="text-button" data-home>Explore another direction</button></div>`;
    }
    if(node.kind==='support')content=`<div class="journey-decision"><h2 id="journey-title">Bring the details to support.</h2><p class="journey-help">There isn’t a matching guide on this route yet. Keep notes about the affected head, the message and what you have already checked. Keep a new printer stock while investigating.</p><a class="button primary" href="https://snapmaker.formcrafts.com/u1-troubleshooting-request">Contact official U1 support</a><a class="text-link" href="https://wiki.snapmaker.com/en/snapmaker_u1">Read official U1 guides</a></div>`;
    if(node.kind==='search')content=`<div class="journey-decision"><h2 id="journey-title">Describe what you’re seeing.</h2><p class="journey-help">Search the curated symptom phrases, then read the matching guide’s limitations.</p><a class="button primary" href="${e(path(base,'fixes/'))}">Search all symptoms</a></div>`;
    if(node.kind==='plan'){startPlanner();return;}
    scenes.innerHTML=`${past}<section class="journey-scene ${['fix','resources'].includes(node.kind)?'is-guide':''}" id="journey-active" tabindex="-1" aria-label="${e(title(node))}">${trail.length?`<button type="button" class="text-button journey-back" data-trail="${choices.length-1}">Back</button>`:''}${content}</section>`;
    main.querySelector('#journey-status').textContent=`${title(node)}. ${node.kind==='fix'?'Matching guide opened.':'Choose your next direction.'}`;
    if(scroll)focus(main.querySelector('#journey-active'));
  }
  function advance(id){choices=chooseJourney(data,choices,id,items);save();draw(true);}
  main.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.hasAttribute('data-map-open')){dialog.showModal();return;}
    if(button.hasAttribute('data-map-close')){dialog.close();return;}
    if(button.dataset.mapTarget){focus(main.querySelector(`#map-${button.dataset.mapTarget}`));return;}
    if(button.hasAttribute('data-home')){choices=[];save();draw(true);return;}
    if(button.dataset.trail!==undefined){choices=choices.slice(0,Number(button.dataset.trail));save();draw(true);return;}
    if(button.dataset.edge){advance(button.dataset.edge);return;}
    if(button.dataset.planItem&&items.some(item=>item.id===button.dataset.planItem)){startPlanner({initialState:{...current.state,selected:[...current.state.selected,button.dataset.planItem]}});return;}
    if(button.hasAttribute('data-still')||button.hasAttribute('data-helped')){advance('next');advance(button.hasAttribute('data-still')?'nothelped':'helped');return;}
    if(button.hasAttribute('data-related')){const card=fixes.find(card=>card.id===current.node.fix_id);startPlanner({initialState:{...current.state,selected:card.related_items}});}
  });
  main.addEventListener('change',event=>{
    if(event.target.id!=='software-platform'||current.node.kind!=='resources')return;
    const options=current.node.item_ids.map(id=>items.find(item=>item.id===id)),selected=filterSoftware(options,{platform:event.target.value});
    main.querySelector('#software-count').textContent=`${selected.length} of ${options.length} options`;
    main.querySelector('#software-results').innerHTML=selected.length?selected.map(item=>softwareCard(item,base)).join(''):'<p>No tools in this group list that platform. Choose another platform or browse all software guides.</p>';
  });
  dialog.addEventListener('close',()=>main.querySelector('[data-map-open]').focus());
  document.querySelector('.skip-link').addEventListener('click',event=>{if(!planner){event.preventDefault();focus(main);}});
  function restore(){if(location.hash.startsWith('#plan=')){startPlanner();return;}const restored=decodeJourney(location.hash,data,items);choices=restored.choices;main.querySelector('#journey-notice').hidden=restored.valid;draw(true);}
  window.onhashchange=restore;
  const requested=new URL(location.href).searchParams.get('item');
  if(location.hash.startsWith('#plan='))startPlanner();
  else if(requested&&items.some(item=>item.id===requested)){const url=new URL(location.href);url.searchParams.delete('item');history.replaceState(null,'',url);startPlanner({initialState:{selected:[requested]}});}
  else draw(choices.length>0);
}
