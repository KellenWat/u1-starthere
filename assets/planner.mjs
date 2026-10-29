// Pure deterministic planner. See PLANNER.md; no browser APIs or catalog copy.
export const CHOICES = {
  stage:['not-arrived','stock','mods','paxx12'], materials:['basic','abs','abrasive','colors'],
  enclosure:['none','diy','official','other'], budget:[0,50,150,300],
  bothers:['noise','fumes','reliability','speed-flow','color-count','dry-filament'],
  comfort:['basic','firmware','soldering'], location:['living-space','office','garage-workshop']
};
export const DEFAULTS = {stage:'stock',materials:'basic',enclosure:'none',budget:50,bothers:[],comfort:'basic',location:'office'};
export const MATERIALS = {basic:['pla','petg','tpu'],abs:['abs','asa'],abrasive:['cf-gf'],colors:['five-plus-colors']};
export const compareId = (a,b) => a < b ? -1 : a > b ? 1 : 0;
const intersects = (a,b) => a.some(value=>b.includes(value));
const unique = values => [...new Set(values)];
const cents = value => Math.round(value * 100);
const gateLabel = gate => ({enclosed:'enclosed printing','chamber-heat-safe':'cooling prerequisite for chamber heat','stock-burn-in':'stock baseline','extended-firmware':'extended integrations'}[gate]||gate.replaceAll('-',' '));

export function normalizeState(raw={},items=[]) {
  const input=raw && typeof raw==='object' ? raw : {}, answers={};
  for(const key of Object.keys(DEFAULTS)) {
    if(key==='bothers') { answers[key]=CHOICES.bothers.filter(value=>Array.isArray(input.bothers)&&input.bothers.includes(value)).slice(0,2); continue; }
    const value=key==='budget' && ['string','number'].includes(typeof input[key]) && input[key]!=='' ? Number(input[key]) : input[key];
    answers[key]=CHOICES[key].includes(value)?value:DEFAULTS[key];
  }
  const ids=new Set(items.map(item=>item.id));
  const validIds=key=>Array.isArray(input[key])?unique(input[key].filter(id=>typeof id==='string'&&ids.has(id))).sort(compareId):[];
  const owned=validIds('owned'),selected=validIds('selected').filter(id=>!owned.includes(id));
  return {...answers,owned,selected};
}
export function encodeState(raw,items) { return `#plan=${encodeURIComponent(JSON.stringify({v:1,...normalizeState(raw,items)}))}`; }
export function decodeState(hash,items) {
  if(!hash)return {state:normalizeState({},items),valid:true,shared:false};
  try {
    if(hash.length>12000 || !hash.startsWith('#plan='))throw new Error();
    const raw=JSON.parse(decodeURIComponent(hash.slice(6)));
    if(raw?.v!==1)throw new Error();
    return {state:normalizeState(raw,items),valid:true,shared:true};
  } catch { return {state:normalizeState({},items),valid:false,shared:false}; }
}
export function relevance(item,state) {
  const materials=MATERIALS[state.materials];
  return item.bothers.filter(value=>state.bothers.includes(value)).length*100 +
    (intersects(item.materials_relevance,materials)?10:item.materials_relevance.includes('all')?1:0) +
    (item.locations.includes(state.location)?20:0);
}
export function strategy(state) {
  const material={basic:'PLA, PETG and TPU',abs:'an enclosed ABS/ASA route',abrasive:'abrasive-filament preparation',colors:'more color options'}[state.materials];
  const focus={noise:'lower noise',fumes:'fume management',reliability:'reliability','speed-flow':'speed and flow','color-count':'color options','dry-filament':'dry filament'};
  return `${state.bothers.length?`Focus on ${state.bothers.map(value=>focus[value]).join(' and ')}`:'Start with a clean stock baseline'}, then explore ${material} within $${state.budget}.`;
}
export function conditionWarnings(item) {
  const c=item.conditions,notes=[...item.warnings];
  if(item.warranty_risk!=='none')notes.push(`Warranty risk: ${item.warranty_risk}. Review the current terms and source guide.`);
  if(c.min_stock_days)notes.push(`Wait until stock burn-in is clean and at least ${c.min_stock_days} stock days have passed (Day ${c.min_stock_days+1}+).`);
  if(c.firmware_min)notes.push(`Check the current minimum firmware; the imported source specifies ${c.firmware_min}.`);
  if(c.requires_firmware)notes.push('This setting or option requires compatible extended firmware.');
  if(c.soldering)notes.push('Requires soldering skills and a complete installation guide.');
  if(c.matching_hotends)notes.push('Check the matching-hotend requirement for all heads in the print.');
  if(c.excluded_materials?.length)notes.push(`Do not use this route for: ${c.excluded_materials.join(', ')}.`);
  if(c.required_gates?.length)notes.push('Complete the listed capability prerequisites first; their presence is not a safety certification.');
  if(item.source.credit_status==='pending')notes.push('Original creator credit needs review; check the source note before proceeding.');
  notes.push(item.verified_firmware?`Firmware tested: ${item.verified_firmware}.`:'Firmware compatibility has not been tested by StartHere.');
  return unique(notes);
}

export function buildPlan(inputItems,raw={}) {
  const items=[...inputItems].sort((a,b)=>compareId(a.id,b.id));
  const byId=new Map(items.map(item=>[item.id,item]));
  if(byId.size!==items.length)throw new Error('Duplicate catalog IDs.');
  for(const item of items)for(const id of [...item.requires,...item.conflicts,...item.optional_related_items,...(item.conditions.after_selected||[])])if(!byId.has(id))throw new Error(`Missing catalog reference: ${id}`);
  const checking=new Set(),checked=new Set();
  function validateGraph(id){if(checking.has(id))throw new Error(`Dependency cycle at ${id}.`);if(checked.has(id))return;checking.add(id);for(const dep of byId.get(id).requires)validateGraph(dep);checking.delete(id);checked.add(id);}
  items.forEach(item=>validateGraph(item.id));
  const state=normalizeState(raw,items),materials=MATERIALS[state.materials],cap=cents(state.budget);
  const owned=new Set([...state.owned,...items.filter(item=>item.done_for_stages?.includes(state.stage)||item.done_for_enclosures?.includes(state.enclosure)).map(item=>item.id)]);
  const gates=new Set([...items.filter(item=>owned.has(item.id)).flatMap(item=>item.gates),...(state.enclosure!=='none'?['enclosed']:[])]);
  const requested=new Set(state.selected),score=item=>relevance(item,state);
  const rank=(a,b)=>score(b)-score(a) || Number(b.cost_usd!==null&&cents(b.cost_usd)<=cap)-Number(a.cost_usd!==null&&cents(a.cost_usd)<=cap) ||
    (a.cost_usd===null?Infinity:a.cost_usd)-(b.cost_usd===null?Infinity:b.cost_usd) || compareId(a.id,b.id);
  function hardReason(item) {
    const c=item.conditions;
    if(c.soldering && state.comfort!=='soldering')return 'This route requires soldering comfort.';
    if(item.category==='firmware'&&item.type==='install'&&state.comfort==='basic')return 'Your comfort choice excludes installing firmware.';
    if(c.materials_any && !intersects(c.materials_any,materials))return 'This material-specific route does not match your material answer.';
    if(c.excluded_materials && materials.every(material=>c.excluded_materials.includes(material)))return 'The source excludes your selected material from this route.';
    if(item.gates.includes('enclosed')&&gates.has('enclosed'))return 'Your reported enclosure already supplies this capability; a second enclosure route is not added.';
    const conflict=item.conflicts.find(id=>owned.has(id));
    if(conflict)return `Conflicts with your already fitted ${byId.get(conflict).title}.`;
    return null;
  }
  const rootSkip=new Map();
  for(const item of items)if(!owned.has(item.id)&&!hardReason(item)&&!requested.has(item.id)) {
    if(item.conditions.on_request)rootSkip.set(item.id,{code:'on-request',reason:'Optional purchase or accessory; add it only if you want this route.'});
    else if(item.conditions.interests_any&&!intersects(item.conditions.interests_any,state.bothers))rootSkip.set(item.id,{code:'interest',reason:'Not triggered by the concerns you selected; available as an explicit option.'});
  }
  // A failed budget-sensitive alternative is kept visible while a cheaper route is tried.
  const budgetBanned=new Map();
  let final;
  for(let attempt=0;attempt<=items.length;attempt++) {
    const nodes=new Set(),deps=new Map(),blocked=new Map(),gateChoices=new Map(),stack=new Set();
    const roots=items.filter(item=>!owned.has(item.id)&&!hardReason(item)&&!rootSkip.has(item.id)&&!budgetBanned.has(item.id)).map(item=>item.id);
    function ensure(id) {
      if(owned.has(id))return true;
      if(stack.has(id))throw new Error(`Dependency or capability cycle at ${id}.`);
      if(blocked.has(id))return false;
      if(nodes.has(id))return true;
      const item=byId.get(id),hard=hardReason(item);
      if(hard||budgetBanned.has(id)){blocked.set(id,{code:budgetBanned.has(id)?'budget':'condition',reason:hard||budgetBanned.get(id).reason});return false;}
      stack.add(id); const required=new Set(item.requires);
      const needs=unique([...(item.conditions.required_gates||[]),...(item.conditions.requires_firmware?['extended-firmware']:[])]);
      for(const gate of needs)if(!gates.has(gate)) {
        if(!gateChoices.has(gate)) {
          const provider=items.filter(p=>p.gates.includes(gate)&&!owned.has(p.id)&&!hardReason(p)&&!budgetBanned.has(p.id)).sort(rank)[0];
          gateChoices.set(gate,provider?.id||null);
        }
        const provider=gateChoices.get(gate);
        if(!provider){const pricedOut=items.some(p=>p.gates.includes(gate)&&budgetBanned.has(p.id));blocked.set(id,{code:pricedOut?'budget':'condition',reason:pricedOut?`Every available ${gate.replaceAll('-',' ')} route was deferred by your budget.`:`No compatible available route supplies ${gate.replaceAll('-',' ')}.`});stack.delete(id);return false;}
        required.add(provider);
      }
      deps.set(id,required);
      for(const dep of required)if(!ensure(dep)) {
        const why=blocked.get(dep);
        blocked.set(id,{code:why?.code||'condition',reason:`Needs ${byId.get(dep).title} first. ${why?.reason||'That prerequisite is unavailable.'}`});
        stack.delete(id);return false;
      }
      stack.delete(id);nodes.add(id);return true;
    }
    for(const id of roots)ensure(id);
    const winners=[];
    for(const item of [...nodes].map(id=>byId.get(id)).sort(rank)) {
      const keeper=winners.find(other=>item.conflicts.includes(other.id)||other.conflicts.includes(item.id));
      if(keeper)blocked.set(item.id,{code:'conflict',reason:`Alternative to ${keeper.title}; that route has higher relevance or wins the budget/price tie-break for your answers.`});
      else winners.push(item);
    }
    let changed=true;
    while(changed){changed=false;for(const id of nodes)if(!blocked.has(id))for(const dep of deps.get(id)||[])if(blocked.has(dep)){
      const why=blocked.get(dep);blocked.set(id,{code:why.code,reason:`Needs ${byId.get(dep).title}, which is unavailable: ${why.reason}`});changed=true;break;
    }}
    const live=new Set();
    function retain(id){if(owned.has(id)||blocked.has(id)||live.has(id))return;live.add(id);for(const dep of deps.get(id)||[])retain(dep);}
    roots.filter(id=>nodes.has(id)&&!blocked.has(id)).forEach(retain);
    // Follow-up habits wait until selected configuration changes, without requiring a purchase.
    const orderDeps=new Map([...live].map(id=>[id,new Set([...(deps.get(id)||[]),...(byId.get(id).conditions.after_selected||[]).filter(other=>live.has(other))])]));
    const sorted=[],pending=new Set(live),emitted=new Set(owned);
    while(pending.size){
      const ready=[...pending].filter(id=>[...(orderDeps.get(id)||[])].every(dep=>emitted.has(dep))).map(id=>byId.get(id));
      ready.sort((a,b)=>a.phase-b.phase||score(b)-score(a)||compareId(a.id,b.id));
      if(!ready.length)throw new Error('The catalog dependency graph cannot be ordered.');
      const item=ready[0];pending.delete(item.id);emitted.add(item.id);sorted.push(item);
    }
    const accepted=new Set(owned),steps=[],deferred=[],quotes=[]; let spent=0,time=0;
    for(const item of sorted){
      const missing=[...(deps.get(item.id)||[])].filter(id=>!accepted.has(id));
      const quoteMissing=missing.some(id=>quotes.some(entry=>entry.item.id===id));
      if(item.cost_usd===null||quoteMissing){quotes.push({item,code:'quote',reason:item.cost_usd===null?'Variable cost: obtain a price quote before budgeting.':`Needs a price quote for ${missing.map(id=>byId.get(id).title).join(', ')} first.`});continue;}
      if(missing.length||spent+cents(item.cost_usd)>cap){deferred.push({item,code:'budget',reason:missing.length?`Deferred with prerequisite: ${missing.map(id=>byId.get(id).title).join(', ')}.`:`Does not fit the $${state.budget} cap after earlier steps.`,remaining_usd:(cap-spent)/100});continue;}
      spent+=cents(item.cost_usd);time+=item.time_minutes;accepted.add(item.id);
      steps.push({item,number:steps.length+1,cost_to_here:spent/100,time_to_here:time,dependencies:[...(deps.get(item.id)||[])],order_after:(item.conditions.after_selected||[]).filter(id=>live.has(id)),score:score(item)});
    }
    const failedRoute=deferred.find(entry=>entry.item.conflicts.length||entry.item.gates.some(gate=>[...gateChoices.values()].includes(entry.item.id)));
    if(failedRoute&&!budgetBanned.has(failedRoute.item.id)) {budgetBanned.set(failedRoute.item.id,failedRoute);continue;}
    final={steps,deferred,quotes,blocked,deps,live,spent,time};break;
  }
  if(!final)throw new Error('Alternative route selection did not converge.');
  const stepsById=new Map(final.steps.map(step=>[step.item.id,step]));
  for(const step of final.steps){
    const item=step.item,reasons=[];
    if(requested.has(item.id))reasons.push('You added this option');
    for(const bother of item.bothers.filter(bother=>state.bothers.includes(bother)))reasons.push(`Matches: ${bother.replaceAll('-',' ')}`);
    if(intersects(item.materials_relevance,materials))reasons.push(`Materials: ${materials.filter(m=>item.materials_relevance.includes(m)).join(', ').toUpperCase()}`);
    for(const gate of item.gates)reasons.push(`Unlocks: ${gateLabel(gate)}`);
    const forSteps=final.steps.filter(other=>other.dependencies.includes(item.id)).map(other=>other.number);
    if(forSteps.length)reasons.push(`Prerequisite for step${forSteps.length>1?'s':''} ${forSteps.join(', ')}`);
    const missing=unique([...step.dependencies,...step.order_after]).filter(id=>stepsById.has(id)).map(id=>stepsById.get(id).number).sort((a,b)=>a-b);
    if(missing.length)reasons.push(`After step${missing.length>1?'s':''} ${missing.join(', ')}`);
    if(!reasons.length)reasons.push(item.phase<=2?'Stock setup and baseline':'General community option');
    step.reasons=reasons;step.warnings=conditionWarnings(item);
    step.optional=item.optional_related_items.map(id=>({item:byId.get(id),reasons:['Optional related option; outside totals unless added'],in_plan:stepsById.has(id),already_owned:owned.has(id),warnings:conditionWarnings(byId.get(id))}));
  }
  const deferred=[...budgetBanned.values(),...final.deferred,...items.filter(item=>final.blocked.get(item.id)?.code==='budget').map(item=>({item,...final.blocked.get(item.id)}))].filter((entry,index,array)=>array.findIndex(other=>other.item.id===entry.item.id)===index);
  const handled=new Set([...owned,...final.steps.map(step=>step.item.id),...deferred.map(entry=>entry.item.id),...final.quotes.map(entry=>entry.item.id)]);
  const excluded=items.filter(item=>!handled.has(item.id)).map(item=>({item,...(final.blocked.get(item.id)|| (hardReason(item)?{code:'condition',reason:hardReason(item)}:null) ||rootSkip.get(item.id)||{code:'dependency',reason:'Only needed by an option that is not in this plan.'})}));
  return {state,strategy:strategy(state),steps:final.steps,deferred,quotes:final.quotes,excluded,already:items.filter(item=>owned.has(item.id)),total_cost:final.spent/100,total_minutes:final.time,budget:state.budget};
}
