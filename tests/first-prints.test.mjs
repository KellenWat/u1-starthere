import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {walkJourney} from '../assets/journey.mjs';
import {buildPlan} from '../assets/planner.mjs';
import {renderResources,printCard} from '../assets/resource-view.mjs';
const read=async name=>JSON.parse(await readFile(new URL(name,import.meta.url),'utf8'));
const {items}=await read('../data/items.json'),journey=await read('../data/journey.json'),{phases,milestones}=await read('../data/phases.json');
const ids=['split-waste-chute','waste-deflector-wall'];
const prints=items.filter(item=>item.community_evidence);

test('setup stays with easy prints while improvement and exploration share three usage levels',()=>{
  const routes=[['new','prints'],['improve','prints','early'],['explore','prints','early']];
  for(const choices of routes){
    const {node}=walkJourney(journey,choices,items);
    assert.equal(node.id,'first-prints');assert.deepEqual(node.item_ids,[...ids,'buildsheet-holder-two-versions']);
  }
  for(const root of ['improve','explore'])for(const level of ['everyday','advanced'])assert.equal(walkJourney(journey,[root,'prints',level],items).node.id,level+'-prints');
  assert.equal(walkJourney(journey,['new','prints','next'],items).trail.at(-1).edge.label,'Explore another direction');
});

test('useful prints stay optional after stock checks and never become readiness requirements',()=>{
  assert.equal(prints.length,9);
  for(const {id} of prints){
    const item=items.find(item=>item.id===id),step=phases.flatMap(phase=>phase.steps).find(step=>step.item_id===id);
    assert.equal(item.conditions.on_request,true);assert.ok(item.requires.includes('stock-burn-in-complete'));
    assert.equal(item.cost_usd,null);assert.equal(item.verified_firmware,null);
    assert.equal(item.source.kind,'model');
    assert.ok(item.source.creator||item.source.credit_status==='pending');
    assert.equal(step.optional,true);assert.ok(step.requires_steps.includes('save-baseline'));
    assert.ok(milestones.every(milestone=>!milestone.step_ids.includes(step.id)));
    assert.ok(!buildPlan(items,{stage:'paxx12',comfort:'soldering',budget:300}).steps.some(step=>step.item.id===id));
    assert.ok(buildPlan(items,{stage:'paxx12',comfort:'soldering',budget:300,selected:[id]}).quotes.some(entry=>entry.item.id===id));
  }
});

test('electronics projects respect skill limits and retain cooling prerequisites',()=>{
  for(const id of ['tareku-cooling-brackets']){
    const plan=buildPlan(items,{comfort:'basic',selected:[id]});
    assert.ok(!plan.steps.some(step=>step.item.id===id));
    assert.ok(!plan.quotes.some(entry=>entry.item.id===id));
    assert.ok(plan.excluded.some(entry=>entry.item.id===id&&entry.reason.includes('soldering')));
  }
  assert.ok(items.find(item=>item.id==='tareku-cooling-brackets').requires.includes('mainboard-psu-cooling'));
  const covered=buildPlan(items,{owned:['official-top-cover'],selected:['cyberdyne-vented-cover']});
  assert.ok(covered.excluded.some(entry=>entry.item.id==='cyberdyne-vented-cover'&&entry.reason.includes('already fitted')));
});

test('print destination shows model links, creator credits and fit limits without software controls',()=>{
  const node=journey.nodes.find(node=>node.id==='first-prints'),base='https://example.github.io/u1-starthere/';
  const html=renderResources(node,items,base);
  assert.ok(!html.includes('software-platform')&&!html.includes('All software guides'));
  for(const id of ids){
    const item=items.find(item=>item.id===id);
    assert.ok(html.includes(item.source.url)&&html.includes(item.source.creator));
    assert.ok(html.includes(base+'item/'+id+'/'));
    for(const note of item.warnings)assert.ok(html.includes(note));
  }
  assert.ok(html.includes('fit not tested'));
  const card=printCard(items.find(item=>item.id===ids[0]),items,base);
  assert.ok(card.indexOf('Open creator’s model')<card.indexOf('<details'));
});

test('print cards escape imported text and reject unsafe creator links',()=>{
  const item={...items.find(item=>item.id===ids[0]),title:'<script>bad()</script>',warnings:['<img onerror=bad()>'],source:{creator:'<svg>',url:'javascript:bad()'},community_evidence:[{creator:'<img>',note:'<script>bad()</script>',url:'javascript:bad()'}]};
  const html=printCard(item,items,'https://example.test/');
  assert.ok(!html.includes('<script>')&&!html.includes('<img onerror')&&!html.includes('href="javascript:'));
  assert.ok(html.includes('&lt;script&gt;'));
});
