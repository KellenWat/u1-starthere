import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {searchFixes,codeQuery} from '../assets/fix-search.mjs';
import {renderFix,renderFixSummary} from '../assets/fix-view.mjs';
import {escape} from '../assets/view.mjs';
const read=async name=>JSON.parse(await readFile(new URL(name,import.meta.url),'utf8'));
const {fixes}=await read('../data/fixes.json'),{items}=await read('../data/items.json'),fixtures=await read('./fixtures/fix-search.json');
const codeFixtures=await read('./fixtures/error-codes.json');
for(const fixture of codeFixtures)test(`Documented code: ${fixture.query}`,()=>{
  assert.equal(searchFixes(fixes,fixture.query)[0]?.card.id,fixture.id);
});

for(const fixture of fixtures)test(`Seed symptom #1: ${fixture.query}`,()=>{
  assert.equal(searchFixes(fixes,fixture.query)[0]?.card.id,fixture.id);
});
test('every additional authored symptom ranks its own card first',()=>{
  assert.equal(fixtures.length,12);
  assert.ok(fixtures.every(fixture=>fixes.some(card=>card.id===fixture.id)));
  for(const card of fixes)for(const symptom of card.symptoms)assert.equal(searchFixes(fixes,symptom)[0]?.card.id,card.id,symptom);
});

test('every documented code maps exactly to its authored guide, independent of order',()=>{
  assert.equal(fixes.flatMap(card=>card.codes).length,37);
  for(const card of fixes)for(const code of card.codes){
    for(const query of [code,code.replaceAll('-',' '),code.replaceAll('-',''),`Error code: ${code} please help`,code.replaceAll('-','–')]){
      assert.equal(searchFixes(fixes,query)[0]?.card.id,card.id,query);
      assert.deepEqual(searchFixes(fixes,query),searchFixes([...fixes].reverse(),query));
    }
  }
});

test('unknown and incomplete codes never fall back to a misleading numeric or symptom match',()=>{
  for(const query of ['0002-0523-0001-0046','0002 0523 0001','0045','code 0045','0002-0523-0001-0045-0000','0002-0523-0001-0046 pogo contact','00020523000100460000','0002-0523-0001-0045 / 0002-0523-0001-0040'])assert.deepEqual(searchFixes(fixes,query),[],query);
  assert.equal(codeQuery('driver temps 85 to 92 degrees normal').mode,'symptom');
  assert.equal(searchFixes(fixes,'0002-0523-0001-0045')[0].card.id,'pogo-contact-anomaly');
  assert.equal(searchFixes(fixes,'0001-0523-0000-0037')[0].card.id,'pogo-cleaning-reminder-loop');
  const unreviewed={...fixes.find(card=>card.codes.length),code_evidence:undefined};
  assert.deepEqual(searchFixes([unreviewed],unreviewed.codes[0]),[]);
});

test('coded guide views show complete identifiers, review evidence and safe shareable links',()=>{
  for(const card of fixes.filter(card=>card.codes.length)){
    const html=renderFix(card,items,'https://example.github.io/u1-starthere/');
    const summary=renderFixSummary(card);
    for(const code of card.codes)assert.ok(summary.includes(`<code>${code}</code>`));
    assert.ok(!summary.includes('<details')&&!summary.includes('<a '));
    for(const code of card.codes)assert.ok(html.includes(`/u1-starthere/fixes/?q=${code}`));
    for(const source of card.code_evidence.sources)assert.ok(html.includes(source.url));
    assert.ok(html.includes('not tested on a printer'));
  }
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
    assert.ok(html.includes('Firmware: Not tested'));
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
