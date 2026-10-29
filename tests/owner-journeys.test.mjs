import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {walkJourney} from '../assets/journey.mjs';
import {readProgress} from '../assets/progress.mjs';
import {milestoneProgress,renderMilestones,renderTrackStep} from '../assets/track-view.mjs';
const read=async name=>JSON.parse(await readFile(new URL(name,import.meta.url),'utf8'));
const track=await read('../data/phases.json'),journey=await read('../data/journey.json'),{items}=await read('../data/items.json'),fixtures=await read('./fixtures/owner-journeys.json');
const steps=track.phases.flatMap(phase=>phase.steps),first=track.milestones[0];

for(const fixture of fixtures)test(`Owner walkthrough: ${fixture.name}`,()=>{
  const {node}=walkJourney(journey,fixture.choices,items);
  assert.equal(node.kind,'track');assert.equal(node.step_id,fixture.step_id);
  assert.ok(steps.find(step=>step.id===node.step_id)?.guidance);
});

test('first-print preparation includes actual loading, a file and matching material, before printing',()=>{
  const position=id=>steps.findIndex(step=>step.id===id);
  for(const id of ['assemble-printer','stock-calibration','prepare-first-file','load-first-filament','check-first-print']){
    assert.ok(first.step_ids.includes(id),id);
    assert.ok(position(id)<position('start-first-print'),id);
  }
  assert.ok(position('start-first-print')<position('watch-first-layer'));
  assert.ok(position('watch-first-layer')<position('cool-first-print'));
  assert.ok(position('cool-first-print')<position('test-four-heads'));
});

test('historical checks do not silently mark newly added readiness checks complete',()=>{
  const historical=readProgress({version:1,steps:{'stock-calibration':'done','test-four-heads':'done','test-four-color':'done','save-baseline':'done'}},track.phases);
  assert.equal(historical.steps['test-four-heads'],'done');
  assert.equal(milestoneProgress(first,historical,track.phases).complete,false);
  const all={version:1,steps:Object.fromEntries(steps.map(step=>[step.id,'done']))};
  delete all.steps['load-first-filament'];
  assert.equal(milestoneProgress(first,all,track.phases).next.id,'load-first-filament');
  assert.equal(milestoneProgress(track.milestones[1],all,track.phases).complete,false);
  all.steps['load-first-filament']='done';
  assert.equal(milestoneProgress(first,all,track.phases).complete,true);
});

test('readiness gives one next action and does not present optional work as a first-print gate',()=>{
  const progress={version:1,steps:{}};
  const html=renderMilestones(track.milestones,progress,track.phases);
  assert.equal((html.match(/Next unchecked check/g)||[]).length,1);
  assert.ok(!html.includes('Stock baseline checked'));
  const status=milestoneProgress(first,progress,track.phases);
  assert.ok(status.total<steps.length);
  assert.ok(first.step_ids.every(id=>!steps.find(step=>step.id===id).optional));
});

test('first-use guides show steps, success checks, recovery and credited sources before related catalog links',()=>{
  for(const step of steps.filter(step=>step.guidance)){
    const html=renderTrackStep(step,steps,items,'https://example.github.io/u1-starthere/',true);
    assert.ok(html.includes('class="step-guide" open'));
    for(const label of ['Done when','If you get stuck','Source reviewed','not tested on a printer'])assert.ok(html.includes(label));
    assert.ok(html.indexOf('step-guide')<html.indexOf('Related catalog guide'));
    for(const source of step.guidance.sources)assert.ok(html.includes(source.url)&&html.includes(source.creator));
    for(const id of step.requires_steps||[])assert.ok(html.includes(`#step-${id}`));
  }
});

test('guide views escape content and do not permit unsafe source schemes',()=>{
  const original=steps.find(step=>step.guidance),step={...original,text:'<img onerror=evil()>',guidance:{...original.guidance,actions:['<script>bad()</script>'],sources:[{creator:'<svg>',url:'javascript:bad()',note:'<b>unsafe</b>'}]}};
  const html=renderTrackStep(step,steps,items,'https://example.test/',true);
  assert.ok(!html.includes('<script>')&&!html.includes('<img onerror')&&!html.includes('href="javascript:'));
  assert.ok(html.includes('&lt;script&gt;'));
});
