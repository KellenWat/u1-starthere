import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {searchFixes} from '../assets/fix-search.mjs';
import {renderFix} from '../assets/fix-view.mjs';
import {escape} from '../assets/view.mjs';
const read=async name=>JSON.parse(await readFile(new URL(name,import.meta.url),'utf8'));
const {fixes}=await read('../data/fixes.json'),{items}=await read('../data/items.json'),fixtures=await read('./fixtures/fix-search.json');

for(const fixture of fixtures)test(`Seed symptom #1: ${fixture.query}`,()=>{
  assert.equal(searchFixes(fixes,fixture.query)[0]?.card.id,fixture.id);
});
test('every additional authored symptom ranks its own card first',()=>{
  assert.equal(fixtures.length,12);
  assert.deepEqual(new Set(fixtures.map(fixture=>fixture.id)),new Set(fixes.map(card=>card.id)));
  for(const card of fixes)for(const symptom of card.symptoms)assert.equal(searchFixes(fixes,symptom)[0]?.card.id,card.id,symptom);
});
test('short symptom searches work without depending on case, punctuation or data order',()=>{
  for(const [query,id] of [['RFID','dryer-feed-rfid-loss'],['prime TOWER falling!','prime-tower-toppling'],['VFA','vfa-banding'],['nozzle grease','nozzle-grease-calibration']]){
    assert.equal(searchFixes(fixes,query)[0]?.card.id,id);
    assert.deepEqual(searchFixes(fixes,query),searchFixes([...fixes].reverse(),query));
  }
});
test('unknown, punctuation-only and stopword-only queries do not invent a match',()=>{
  for(const query of ['unicorn teleportation','!!!','the and my'])assert.deepEqual(searchFixes(fixes,query),[]);
  assert.equal(searchFixes(fixes,'').length,fixes.length);
});
test('fix views retain ordered steps, stop conditions, creator credit and honest firmware status',()=>{
  for(const card of fixes){
    const html=renderFix(card,items,'https://example.github.io/u1-starthere/');
    assert.ok(html.indexOf('fix-stop')<html.indexOf('fix-steps'));
    assert.ok(html.includes('Firmware behavior not tested.'));
    assert.ok(html.includes(card.support_url));
    assert.ok(html.includes(card.source.creator));
    let previous=-1;for(const step of card.steps){const index=html.indexOf(escape(step));assert.ok(index>previous,card.id);previous=index;}
    for(const id of card.related_items)assert.ok(html.includes(`/u1-starthere/item/${id}/`));
  }
});
test('unexpected fix text and unsafe source links are escaped',()=>{
  const card={...fixes[0],title:'<img onerror=evil()>',steps:['<script>evil()</script>'],source:{...fixes[0].source,url:'javascript:evil()'}};
  const html=renderFix(card,items,'https://example.test/');
  assert.ok(!html.includes('<script>')&&!html.includes('<img onerror'));
  assert.ok(!html.includes('href="javascript:'));
});
