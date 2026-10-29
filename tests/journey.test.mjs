import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {walkJourney,chooseJourney,encodeJourney,decodeJourney,edges} from '../assets/journey.mjs';
import {remainingQuestions} from '../assets/decision-flow.mjs';
const read=async name=>JSON.parse(await readFile(new URL(name,import.meta.url),'utf8'));
const data=await read('../data/journey.json'),{items}=await read('../data/items.json'),{fixes}=await read('../data/fixes.json');
const walk=choices=>walkJourney(data,choices,items);

test('a clear symptom reaches its fix without the planner questionnaire',()=>{
  assert.equal(walk(['problem','quality','tower']).node.fix_id,'prime-tower-toppling');
  assert.equal(walk(['improve','speed','bands']).node.fix_id,'vfa-banding');
});
test('reliability and troubleshooting share the same question, not duplicate trees',()=>{
  assert.equal(walk(['problem']).node,walk(['improve','reliable']).node);
  assert.equal(walk(['problem','filament','identify']).node,walk(['improve','dry','identify']).node);
});
test('ambiguous recognition asks a clarifier and no dryer gives an honest next question',()=>{
  assert.equal(walk(['problem','filament','identify']).node.id,'dryer');
  assert.equal(walk(['problem','filament','identify','yes']).node.fix_id,'dryer-feed-rfid-loss');
  assert.equal(walk(['problem','filament','identify','no']).node.id,'unmatched');
});
test('fixes offer follow-up routes and a failed attempt does not imply success',()=>{
  assert.equal(walk(['problem','quality','tower','next','nothelped']).node.id,'unmatched');
  assert.equal(walk(['problem','quality','tower','next','helped']).node.id,'improve');
});
test('returning to an earlier shared node truncates descendants instead of looping',()=>{
  const route=['problem','filament','identify','no'];
  const returned=chooseJourney(data,route,'another',items);
  assert.deepEqual(returned,['problem']);
  assert.equal(walk(returned).node.id,'symptoms');
});
test('editing an earlier route removes downstream assumptions before a new branch',()=>{
  const original=['improve','noise','vibration'];
  assert.deepEqual(walk(original).state.bothers,['noise']);
  const changed=chooseJourney(data,original.slice(0,1),'colors',items);
  assert.deepEqual(walk(changed).state.bothers,['color-count']);
  assert.equal(walk(changed).state.materials,'colors');
});
test('every authored node and every fix destination are reachable',()=>{
  const reached=new Set(),pending=[data.start],seenFixes=new Set();
  while(pending.length){const id=pending.pop();if(reached.has(id))continue;const node=data.nodes.find(node=>node.id===id);assert.ok(node,id);reached.add(id);if(node.fix_id)seenFixes.add(node.fix_id);pending.push(...edges(node).map(edge=>edge.next));}
  assert.equal(reached.size,data.nodes.length);
  assert.deepEqual(seenFixes,new Set(fixes.map(card=>card.id)));
});
test('route links restore explicit choices and reject malformed or fabricated paths',()=>{
  const choices=['explore','abs'];
  assert.deepEqual(decodeJourney(encodeJourney(choices),data,items),{choices,valid:true});
  for(const hash of ['#journey=broken','#journey='+encodeURIComponent('{"v":2,"choices":[]}'),encodeJourney(['not-a-choice']),encodeJourney(Array(41).fill('problem'))])assert.equal(decodeJourney(hash,data,items).valid,false);
  assert.throws(()=>walk(['problem','filament','identify','no','another']),/Repeated/);
});
test('remaining intake branches depend on the goal and keep all unasked defaults reviewable',()=>{
  const abs=walk(['explore','abs']);
  const names=remainingQuestions(abs.state,abs.answered);
  assert.ok(!names.includes(1)); // Material already explicitly selected.
  assert.ok(names.includes(2)); // Enclosure matters for ABS.
  const colors=walk(['explore','colors']);
  const colorNames=remainingQuestions(colors.state,colors.answered);
  assert.ok(!colorNames.includes(1)&&!colorNames.includes(4));
  assert.ok(!colorNames.includes(2)&&!colorNames.includes(6));
  assert.ok(colorNames.includes(3)&&colorNames.includes(5));
  assert.ok(names.length<=7&&colorNames.length<=7);
});
