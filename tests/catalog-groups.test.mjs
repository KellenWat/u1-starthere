import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {catalogItems} from '../assets/view.mjs';
import {groupCatalog,renderCatalog,catalogEntry} from '../assets/catalog-view.mjs';
const data=JSON.parse(await readFile(new URL('../data/items.json',import.meta.url),'utf8'));
const items=catalogItems(data.items),definitions=data.catalog_groups;

test('catalog sections account for every item exactly once in authored section order',()=>{
  const groups=groupCatalog(items,definitions),ids=groups.flatMap(group=>group.items.map(item=>item.id));
  assert.equal(ids.length,items.length);assert.equal(new Set(ids).size,items.length);
  assert.deepEqual(groups.map(group=>group.id),definitions.map(group=>group.id));
  for(const group of groups){
    assert.ok(group.items.every(item=>group.categories.includes(item.category)));
    for(let i=1;i<group.items.length;i++)assert.ok(group.items[i-1].phase<=group.items[i].phase);
  }
  assert.throws(()=>groupCatalog(items,definitions.slice(1)),/exactly one/);
  assert.throws(()=>groupCatalog(items,[...definitions,definitions[0]]),/exactly one/);
});
test('software and other filters keep their matches across categories without empty sections',()=>{
  for(const filters of [{category:'software',platform:'ios'},{category:'printed-mod'},{q:'pogo'},{cost:'0'}]){
    const selected=catalogItems(items,filters),groups=groupCatalog(selected,definitions);
    assert.equal(groups.flatMap(group=>group.items).length,selected.length);
    assert.ok(groups.every(group=>group.items.length>0));
  }
  assert.equal(groupCatalog(catalogItems(items,{q:'unfindable-test-value'}),definitions).length,0);
});
test('a cached pre-section dataset still renders categories without losing records',()=>{
  const grouped=groupCatalog(items);
  assert.equal(grouped.flatMap(group=>group.items).length,items.length);
  assert.ok(renderCatalog(items,undefined,'https://example.test/').includes('Complete stock burn-in'));
});
test('default browsing opens one section while active filters expose every matching result',()=>{
  const base='https://example.github.io/u1-starthere/';
  const normal=renderCatalog(items,definitions,base),filtered=renderCatalog(items,definitions,base,{filtered:true});
  assert.equal((normal.match(/id="catalog-group-[^"]+" open/g)||[]).length,1);
  assert.equal((filtered.match(/id="catalog-group-[^"]+" open/g)||[]).length,definitions.length);
  assert.ok(normal.includes('aria-label="Catalog sections"'));
  assert.ok(normal.includes(base+'item/stock-burn-in-complete/'));
  assert.ok(renderCatalog([],definitions,base).includes('No items match'));
});
test('compact cards retain source evidence and material software status with safe imported text',()=>{
  const item=items.find(item=>item.software?.status==='experimental');
  const html=catalogEntry(item,'https://example.test/');
  assert.ok(html.includes('Experimental')&&html.includes(item.source.creator));
  assert.ok(html.includes(item.last_verified)&&html.includes('Not tested'));
  assert.ok(html.includes('Source &amp; review')&&html.includes('Check requirements'));
  const bad=catalogEntry({...item,title:'<script>bad()</script>',summary:'<img onerror=bad()>',source:{...item.source,creator:'<svg>'}},'https://example.test/');
  assert.ok(!bad.includes('<script>')&&!bad.includes('<img onerror'));
});
