import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildPlan,normalizeState,encodeState,decodeState,CHOICES,DEFAULTS} from '../assets/planner.mjs';
const {items}=JSON.parse(await readFile(new URL('../data/items.json',import.meta.url),'utf8'));
const {personas}=JSON.parse(await readFile(new URL('fixtures/planner-personas.json',import.meta.url),'utf8'));
function invariants(plan,records=items){
  const emitted=new Set(plan.already.map(item=>item.id));
  let cost=0,time=0;
  for(const step of plan.steps){
    assert.ok(step.reasons.length,step.item.id);
    for(const id of step.dependencies)assert.ok(emitted.has(id),`${id} must precede ${step.item.id}`);
    for(const id of step.order_after)if(plan.steps.some(other=>other.item.id===id))assert.ok(emitted.has(id),`${id} must precede its follow-up ${step.item.id}`);
    assert.ok(!step.item.conflicts.some(id=>emitted.has(id)),`Conflict at ${step.item.id}`);
    assert.notEqual(step.item.cost_usd,null);cost+=Math.round(step.item.cost_usd*100);time+=step.item.time_minutes;
    assert.equal(step.cost_to_here,cost/100);assert.equal(step.time_to_here,time);
    emitted.add(step.item.id);
  }
  assert.equal(plan.total_cost,cost/100);assert.equal(plan.total_minutes,time);assert.ok(cost<=plan.budget*100);
  const classified=[...plan.steps.map(step=>step.item),...plan.already,...plan.deferred.map(entry=>entry.item),...plan.quotes.map(entry=>entry.item),...plan.excluded.map(entry=>entry.item)];
  assert.equal(classified.length,records.length,'Every item must have exactly one visible outcome');
  assert.equal(new Set(classified.map(item=>item.id)).size,records.length,'No duplicate outcomes');
  for(const entry of [...plan.deferred,...plan.quotes,...plan.excluded])assert.ok(entry.reason);
}
for(const persona of personas)test(`Golden persona: ${persona.name}`,()=>{
  const plan=buildPlan(items,persona.answers),ids=plan.steps.map(step=>step.item.id);
  for(const id of persona.include)assert.ok(ids.includes(id),`Missing ${id}`);
  for(const id of persona.exclude)assert.ok(!ids.includes(id),`Unexpected ${id}`);
  for(const [first,last] of persona.before)assert.ok(ids.indexOf(first)<ids.indexOf(last),`${first} must precede ${last}`);
  if(persona.free_only)assert.ok(plan.steps.every(step=>step.item.cost_usd===0));
  if(persona.warning)assert.ok(plan.steps.find(step=>step.item.id===persona.warning.item).warnings.some(warning=>warning.includes(persona.warning.contains)));
  if(persona.optional){const option=plan.steps.find(step=>step.item.id===persona.optional.item).optional.find(option=>option.item.id===persona.optional.related);assert.ok(option);assert.ok(option.reasons[0].includes('Optional'));assert.ok(!option.in_plan);}
  for(const id of persona.setting_only||[])assert.equal(plan.steps.find(step=>step.item.id===id).item.type,'setting');
  invariants(plan);
});
test('ABS gate falls back to a cheaper lid at $50 and defers all enclosed steps at $0',()=>{
  const answers={materials:'abs',budget:50,comfort:'basic'};
  const cheap=buildPlan(items,answers),ids=cheap.steps.map(step=>step.item.id);
  assert.ok(ids.includes('diy-samla-lid'));assert.ok(ids.indexOf('diy-samla-lid')<ids.indexOf('abs-asa-first-print'));
  assert.ok(cheap.deferred.some(entry=>entry.item.id==='official-top-cover'));
  const zero=buildPlan(items,{...answers,budget:0});
  assert.ok(!zero.steps.some(step=>step.item.id==='abs-asa-first-print'));
  assert.ok(zero.deferred.some(entry=>entry.item.id==='abs-asa-first-print'));
  invariants(cheap);invariants(zero);
});
test('active heater inserts cooling and enclosure before heating',()=>{
  const plan=buildPlan(items,{materials:'abs',budget:300,comfort:'soldering'}),ids=plan.steps.map(step=>step.item.id);
  assert.ok(ids.includes('panda-breath-heater'));
  assert.ok(ids.indexOf('mainboard-psu-cooling')<ids.indexOf('panda-breath-heater'));
  const heater=plan.steps.find(step=>step.item.id==='panda-breath-heater');
  assert.ok(heater.warnings.some(warning=>warning.includes('Day 8+')));
  assert.ok(heater.warnings.some(warning=>warning.includes('Warranty risk')));
  invariants(plan);
});
test('firmware and soldering restrictions survive explicit requests',()=>{
  const plan=buildPlan(items,{comfort:'basic',materials:'abs',budget:300,selected:['mainboard-psu-cooling','paxx12-extended-firmware','panda-breath-heater']});
  for(const id of ['mainboard-psu-cooling','paxx12-extended-firmware','panda-breath-heater'])assert.ok(plan.excluded.some(entry=>entry.item.id===id));
  invariants(plan);
});
test('reported enclosure satisfies the gate and excludes duplicate enclosure purchases',()=>{
  for(const enclosure of ['official','diy','other']){
    const plan=buildPlan(items,{materials:'abs',enclosure,budget:0});
    assert.ok(plan.steps.some(step=>step.item.id==='abs-asa-first-print'));
    assert.ok(!plan.steps.some(step=>step.item.gates.includes('enclosed')));
    invariants(plan);
  }
});
test('optional tags stay outside totals unless explicitly added',()=>{
  const a={comfort:'firmware',budget:300,bothers:['dry-filament']},base=buildPlan(items,a),added=buildPlan(items,{...a,selected:['openspool-ntag215']});
  assert.equal(added.total_cost-base.total_cost,items.find(item=>item.id==='openspool-ntag215').cost_usd);
  assert.ok(added.steps.find(step=>step.item.id==='openspool-ntag215').reasons.includes('You added this option'));
  invariants(added);
});
test('owned dryer removes its purchase cost and still permits dry-feed setup',()=>{
  const plan=buildPlan(items,{budget:0,bothers:['dry-filament'],owned:['space-pi-x4']});
  assert.ok(!plan.steps.some(step=>step.item.id==='space-pi-x4'));
  assert.ok(plan.steps.some(step=>step.item.id==='dryer-dry-feed'));
  invariants(plan);
});
test('unknown expansion prices require a quote and true alternatives are explained',()=>{
  const plan=buildPlan(items,{materials:'colors',comfort:'firmware',budget:300});
  assert.ok(plan.quotes.some(entry=>entry.item.id==='multiace'));
  assert.ok(!plan.steps.some(step=>step.item.cost_usd===null));
  assert.ok(plan.excluded.some(entry=>entry.item.id==='sidecar'&&entry.code==='conflict'));
  invariants(plan);
});
test('canonical hash round-trip validates version, trims unknown IDs and bounds inputs',()=>{
  const raw={stage:'paxx12',budget:0,bothers:['noise','fumes','speed-flow'],owned:['made-up','space-pi-x4','space-pi-x4'],selected:['space-pi-x4','openspool-ntag215']};
  const state=normalizeState(raw,items),encoded=encodeState(raw,items);
  assert.deepEqual(decodeState(encoded,items).state,state);assert.equal(state.bothers.length,2);
  assert.deepEqual(state.owned,['space-pi-x4']);assert.deepEqual(state.selected,['openspool-ntag215']);
  for(const hash of ['#plan=%ZZ','#plan=null','#plan=%7B%22v%22%3A2%7D','#plan='+('a'.repeat(13000))])assert.equal(decodeState(hash,items).valid,false);
  assert.equal(normalizeState({budget:false},items).budget,DEFAULTS.budget);
});
test('all five personas are independent of JSON record order',()=>{
  for(const persona of personas)assert.deepEqual(buildPlan(items,persona.answers),buildPlan([...items].reverse(),persona.answers));
});
test('cross-product sample preserves all dependencies, outcomes and budgets',()=>{
  for(const materials of CHOICES.materials)for(const budget of CHOICES.budget)for(const comfort of CHOICES.comfort)for(const enclosure of CHOICES.enclosure){
    invariants(buildPlan(items,{materials,budget,comfort,enclosure,bothers:['noise','reliability'],location:'living-space'}));
  }
});
test('missing IDs and dependency cycles fail instead of producing a partial plan',()=>{
  assert.throws(()=>buildPlan([{...items[0],requires:['missing']}]),/Missing catalog reference/);
  assert.throws(()=>buildPlan([{...items[0],requires:[items[0].id],optional_related_items:[]}]),/cycle/);
});
test('calibration follows selected riser/cover changes without requiring their purchase',()=>{
  const plan=buildPlan(items,{materials:'abs',budget:300,comfort:'soldering',bothers:['reliability','noise']});
  const ids=plan.steps.map(step=>step.item.id),calibration=ids.indexOf('vibration-recalibration');
  for(const id of ['just-a-riser-xl','official-top-cover','diy-samla-lid','biqu-popcap'])if(ids.includes(id))assert.ok(ids.indexOf(id)<calibration);
  const zero=buildPlan(items,{budget:0,bothers:['noise'],comfort:'soldering'});
  assert.ok(zero.steps.some(step=>step.item.id==='vibration-recalibration'));
  assert.ok(!zero.steps.some(step=>step.item.id==='concrete-paver-base'));
  invariants(plan);invariants(zero);
});
test('abrasive materials select hardened hotends and cannot force an excluded high-flow route',()=>{
  const plan=buildPlan(items,{materials:'abrasive',budget:50,selected:['liber-high-flow-hotends']});
  assert.ok(plan.steps.some(step=>step.item.id==='hardened-steel-hotends'));
  assert.ok(plan.excluded.some(entry=>entry.item.id==='liber-high-flow-hotends'&&entry.code==='condition'));
  invariants(plan);
});
