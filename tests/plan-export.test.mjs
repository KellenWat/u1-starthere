import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildPlan} from '../assets/planner.mjs';
import {renderPlan,planMarkdown,printPlan} from '../assets/plan-view.mjs';
import {escape} from '../assets/view.mjs';
const data=JSON.parse(await readFile(new URL('../data/items.json',import.meta.url),'utf8'));
const base='https://example.github.io/u1-starthere/';

test('every rendered step exposes reasons, price, time, difficulty and source credit',()=>{
  const plan=buildPlan(data.items,{materials:'abs',budget:300,comfort:'soldering'}),html=renderPlan(plan,base,data);
  for(const step of plan.steps){
    assert.ok(html.includes(`data-plan-item="${step.item.id}"`));
    for(const reason of step.reasons)assert.ok(html.includes(escape(reason)));
    assert.ok(html.includes(escape(step.item.source.creator||'Creator credit pending')));
    assert.ok(html.includes(`Difficulty ${step.item.difficulty} of 5`));
  }
  assert.ok(html.includes('Day 8+'));
  assert.ok(html.includes('Warranty risk'));
});
test('markdown preserves the ordered plan, both queues, deferrals, warnings and licenses',()=>{
  const plan=buildPlan(data.items,{bothers:['dry-filament'],budget:300,comfort:'firmware',selected:['biqu-popstation-mini']});
  const text=planMarkdown(plan,base,data);
  for(const heading of ['## Ordered plan','## Shopping list','## Print queue','## Deferred by your budget','## Needs a price quote','## Other options and exclusions','## Already done or fitted'])assert.ok(text.includes(heading));
  assert.ok(text.includes('RFID'));
  assert.ok(text.includes(data.attribution.license_url));
  assert.ok(plan.deferred.length>0);
  for(const entry of plan.deferred)assert.ok(text.includes(entry.reason));
  for(const step of plan.steps)for(const reason of step.reasons)assert.ok(text.includes(reason));
  assert.ok(text.includes(base+'item/'));
});
test('print view keeps RFID warnings and optional tag guidance, not just a shopping list',()=>{
  const plan=buildPlan(data.items,{bothers:['dry-filament'],budget:300,comfort:'firmware'}),html=printPlan(plan,base,data);
  assert.ok(html.includes('Shopping list'));assert.ok(html.includes('Print queue'));
  assert.ok(html.includes('RFID'));assert.ok(html.includes('OpenSpool NTAG215'));
  assert.ok(html.includes('outside totals unless added'));
  for(const step of plan.steps)assert.ok(html.includes(escape(step.item.source.creator||'Creator credit pending')));
});
test('unknown costs and conflict explanations appear in screen and print exports',()=>{
  const plan=buildPlan(data.items,{materials:'colors',comfort:'firmware',budget:300});
  for(const html of [renderPlan(plan,base,data),printPlan(plan,base,data)]){
    assert.ok(html.includes('Needs a price quote'));
    for(const quote of plan.quotes)assert.ok(html.includes(escape(quote.reason)));
    for(const excluded of plan.excluded.filter(entry=>entry.code==='conflict'))assert.ok(html.includes(escape(excluded.reason)));
  }
});
test('screen and print views escape unexpected imported markup and unsafe source links',()=>{
  const clone=structuredClone(data),item=clone.items.find(item=>item.id==='stock-burn-in-complete');
  item.title='<script>notTrusted()</script>';item.summary='<img src=x onerror=bad()>';
  item.source.url='javascript:alert(1)';
  const plan=buildPlan(clone.items);
  for(const html of [renderPlan(plan,base,clone),printPlan(plan,base,clone)]){
    assert.ok(!html.includes('<script>notTrusted()'));
    assert.ok(!html.includes('href="javascript:'));
    assert.ok(html.includes('&lt;script&gt;'));
  }
});
