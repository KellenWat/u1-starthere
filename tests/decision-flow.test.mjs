import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CHOICES,DEFAULTS} from '../assets/planner.mjs';
import {questions,renderDecisionNodes,toggleConcern} from '../assets/decision-flow.mjs';

test('decision diagram exposes every engine intake choice with no missing branch',()=>{
  for(const question of questions){
    assert.deepEqual(question.options.map(([value])=>value),CHOICES[question.name]);
    assert.ok(question.title && question.help);
  }
  assert.equal(questions.length,7);
});
test('concern branches toggle independently, cap at two and never mutate earlier answers',()=>{
  const original=['noise'];
  const pair=toggleConcern(original,'fumes');
  assert.deepEqual(original,['noise']);
  assert.deepEqual(pair,['noise','fumes']);
  assert.equal(toggleConcern(pair,'reliability'),pair);
  assert.deepEqual(toggleConcern(pair,'noise'),['fumes']);
  assert.deepEqual(toggleConcern([], 'fumes'),['fumes']);
});
test('shared or default answers render selected nodes and a deliberate multi-choice continuation',()=>{
  const html=renderDecisionNodes({...DEFAULTS,bothers:['noise','fumes']});
  assert.equal((html.match(/class="decision-node"/g)||[]).length,7);
  assert.ok(html.includes('data-question="stage" data-choice="stock" aria-pressed="true"'));
  assert.ok(html.includes('data-question="bothers" data-choice="fumes" aria-pressed="true"'));
  assert.ok(html.includes('data-next-question="4"'));
  assert.ok(html.includes('with 2 selected'));
  assert.ok(html.includes('id="question-1" aria-labelledby="node-title-1" hidden'));
  assert.ok(html.includes('role="group" aria-labelledby="node-title-0" aria-describedby="help-0"'));
});
