import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {catalogItems,money,escape,itemPath,renderItem,itemCard} from '../assets/view.mjs';
import {readProgress,progressCounts} from '../assets/progress.mjs';

const root = new URL('../',import.meta.url);
const {items} = JSON.parse(await readFile(new URL('data/items.json',root),'utf8'));
const {phases} = JSON.parse(await readFile(new URL('data/phases.json',root),'utf8'));

test('catalog filters combine category, budget, difficulty and phase',()=>{
  const selected = catalogItems(items,{category:'purchase',cost:'50',difficulty:'2',phase:'3'});
  assert.ok(selected.length>0);
  assert.ok(selected.every(item=>item.category==='purchase' && item.cost_usd<=50 && item.difficulty<=2 && item.phase===3));
});
test('free filtering excludes variable prices and costed prerequisites',()=>{
  const free = catalogItems(items,{cost:'0'});
  assert.ok(free.length>0);
  assert.ok(free.every(item=>item.cost_usd===0));
  assert.ok(!free.some(item=>item.cost_usd===null));
  assert.ok(catalogItems(items,{cost:'variable'}).every(item=>item.cost_usd===null));
  assert.equal(money(null),'Price varies');
});
test('phase zero is filterable and text matching is case insensitive',()=>{
  assert.ok(catalogItems(items,{phase:'0'}).every(item=>item.phase===0));
  const creator=items.find(item=>item.source.creator?.includes('Paxx12'));
  assert.ok(catalogItems(items,{q:'pAXX12'}).some(item=>item.id===creator.id));
});
test('zero results are possible and default order is stable',()=>{
  assert.deepEqual(catalogItems(items,{q:'definitely-no-such-u1-item'}),[]);
  const a=catalogItems(items),b=catalogItems([...items].reverse());
  assert.deepEqual(a.map(item=>item.id),b.map(item=>item.id));
  for(let n=1;n<a.length;n++)assert.ok(a[n-1].phase<=a[n].phase);
});
test('progress survives a round trip without importing unknown or invalid state',()=>{
  const step=phases[0].steps[0];
  const optional=phases.flatMap(p=>p.steps).find(step=>step.optional);
  const raw={version:1,steps:{[step.id]:'done',[optional.id]:'skipped',invented:'done'}};
  const clean=readProgress(JSON.stringify(raw),phases);
  assert.deepEqual(clean,{version:1,steps:{[step.id]:'done',[optional.id]:'skipped'}});
  assert.equal(progressCounts(clean,[step,optional]).finished,2);
});
test('required steps cannot be skipped through stored state',()=>{
  const step=phases[0].steps[0];
  assert.deepEqual(readProgress({version:1,steps:{[step.id]:'skipped'}},phases).steps,{});
});
test('corrupt, null and old saved progress do not break the track',()=>{
  for(const raw of ['not json','null','{"version":0,"steps":{}}','[]',null]) {
    assert.deepEqual(readProgress(raw,phases),{version:1,steps:{}});
  }
});
test('a stock-only owner can finish required steps and skip optional changes',()=>{
  const steps=phases.flatMap(p=>p.steps),progress={version:1,steps:{}};
  for(const step of steps)progress.steps[step.id]=step.optional?'skipped':'done';
  const clean=readProgress(progress,phases),counts=progressCounts(clean,steps);
  assert.equal(counts.finished,steps.length);
  assert.ok(counts.done>0 && counts.skipped>0);
});
test('detail links work under a GitHub Pages project prefix',()=>{
  const prefix='https://example.github.io/u1-starthere/';
  assert.equal(itemPath(prefix,items[0].id),`${prefix}item/${items[0].id}/`);
  const card=itemCard(items[0],phases,prefix);
  assert.ok(card.includes(`${prefix}item/${items[0].id}/`));
});
test('detail and card renderers escape imported content',()=>{
  const malicious={...items[0],title:'<img src=x onerror=alert(1)>',summary:'<script>evil()</script>',source:{...items[0].source,url:'javascript:alert(1)',creator:'<svg onload=alert(1)>'}};
  const html=renderItem(malicious,items,phases,'../..');
  assert.ok(!html.includes('<script>evil()'));
  assert.ok(!html.includes('href="javascript:'));
  assert.ok(html.includes('&lt;img'));
  assert.ok(itemCard(malicious,phases,'.').includes('&lt;script&gt;'));
  assert.equal(escape('"&<>'), '&quot;&amp;&lt;&gt;');
});
test('every item has readable source credit, cost note and honest firmware status in its HTML',async()=>{
  for(const item of items){
    const html=await readFile(new URL(`item/${item.id}/index.html`,root),'utf8');
    assert.ok(html.includes(escape(item.title)),item.id);
    assert.ok(html.includes(escape(item.cost_note)),item.id);
    assert.ok(html.includes(escape(item.source.creator || 'Original creator credit pending')),item.id);
    assert.ok(html.includes('Not tested'),item.id);
    assert.ok(html.includes('href="../../catalog/"'),item.id);
  }
  assert.equal((await readdir(new URL('item/',root))).length,items.length);
});
