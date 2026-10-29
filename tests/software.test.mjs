import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderItem,softwareCard,filterSoftware,catalogItems} from '../assets/view.mjs';
import {buildPlan} from '../assets/planner.mjs';
import {walkJourney} from '../assets/journey.mjs';
const read=async file=>JSON.parse(await readFile(new URL(file,import.meta.url),'utf8'));
const {items}=await read('../data/items.json'),{phases}=await read('../data/phases.json'),journey=await read('../data/journey.json');
const software=items.filter(item=>item.software),newGuides=items.filter(item=>item.provenance.seed==='community-docs'&&item.software);

test('all identified documentation gaps have credited, optional, source-reviewed guides',()=>{
  assert.equal(newGuides.length,25);
  for(const item of newGuides){
    assert.equal(item.conditions.on_request,true,item.id);
    assert.equal(item.verified_firmware,null,item.id);
    assert.equal(item.provenance.verification_status,'source-reviewed-not-tested');
    assert.ok(item.software.setup_steps.length>=2&&item.software.docs.length>0);
    assert.ok(item.source.creator&&item.software.firmware&&item.software.hardware&&item.software.accounts);
  }
  for(const id of ['helixscreen','octoeverywhere','spool-link-app','spoolpainter','spoolkid','spooltagger','three-dmrp','spool-studio','openrfid','home-assistant-moonraker','afc-lite-stub','timelapse-recovery'])assert.ok(software.some(item=>item.id===id),id);
});
test('every software guide is reachable through a data-authored resource group',()=>{
  const ids=new Set(journey.nodes.flatMap(node=>node.item_ids||[]));
  for(const item of software)assert.ok(ids.has(item.id),item.id);
  assert.equal(walkJourney(journey,['explore','software','inventory'],items).node.kind,'resources');
  assert.equal(walkJourney(journey,['improve','software','remote'],items).node.id,'software-remote');
  assert.equal(walkJourney(journey,['explore','firmware','installed'],items).node.id,'software');
});
test('documentation-only options do not silently enter any default plan',()=>{
  for(const comfort of ['basic','firmware','soldering']){
    const plan=buildPlan(items,{stage:'paxx12',comfort,budget:300});
    for(const item of newGuides)assert.ok(!plan.steps.some(step=>step.item.id===item.id),item.id);
  }
});
test('an explicitly requested U1 integration still respects firmware and stock-test prerequisites',()=>{
  const blocked=buildPlan(items,{comfort:'basic',selected:['helixscreen']});
  assert.ok(!blocked.steps.some(step=>step.item.id==='helixscreen'));
  const plan=buildPlan(items,{comfort:'firmware',selected:['helixscreen']});
  const ids=plan.steps.map(step=>step.item.id);
  assert.ok(ids.indexOf('stock-burn-in-complete')<ids.indexOf('paxx12-extended-firmware'));
  assert.ok(ids.indexOf('paxx12-extended-firmware')<ids.indexOf('helixscreen'));
  assert.ok(plan.steps.find(step=>step.item.id==='helixscreen').warnings.some(note=>note.includes('stock touchscreen')));
});
test('unknown hardware/service costs stay quoted and never become free',()=>{
  for(const id of ['octoeverywhere','spool-link-app','remote-rfid-wasikuss','drybox-nfc-baze']){
    const plan=buildPlan(items,{stage:'paxx12',comfort:'firmware',budget:300,selected:[id]});
    assert.ok(plan.quotes.some(entry=>entry.item.id===id),id);
    assert.ok(!plan.steps.some(step=>step.item.id===id),id);
  }
});
test('experimental, unmaintained and proof-of-concept status remains visible',()=>{
  for(const [id,status] of [['helixscreen','experimental'],['home-assistant-moonraker','unmaintained'],['spool-link-app','proof-of-concept']]){
    const item=items.find(item=>item.id===id),html=renderItem(item,items,phases,'../..');
    assert.ok(html.includes(`status-${status}`));assert.ok(html.includes('Setup outline'));
    assert.ok(html.includes('Not tested'));assert.ok(html.includes('plan/?item='+id));
  }
});
test('software cards and detail documentation escape content and guard outgoing links',()=>{
  const item={...newGuides[0],software:{...newGuides[0].software,accounts:'<script>bad()</script>',docs:[{label:'<img onerror=bad()>',url:'javascript:bad()',creator:'<svg>'}]}};
  const html=renderItem(item,items,phases,'https://example.github.io/u1-starthere/');
  assert.ok(!html.includes('<script>')&&!html.includes('href="javascript:'));
  assert.ok(softwareCard(item,'https://example.github.io/u1-starthere/').includes('/u1-starthere/item/'));
});
test('platform filters distinguish phone apps from printer features and keep unknown platforms empty',()=>{
  const ios=filterSoftware(software,{platform:'ios'});
  assert.ok(ios.some(item=>item.id==='spoolkid'));
  assert.ok(!ios.some(item=>item.id==='spoolpainter'||item.id==='helixscreen'));
  assert.deepEqual(filterSoftware(software,{platform:'not-a-platform'}),[]);
  assert.ok(catalogItems(items,{category:'software',platform:'android'}).every(item=>item.software?.platforms.includes('android')));
  assert.equal(catalogItems(items,{category:'software'}).length,software.length);
});
test('comparison cards keep status visible while placing full requirements in an expandable section',()=>{
  const item=items.find(item=>item.id==='spool-link-app'),html=softwareCard(item,'.');
  assert.ok(html.indexOf('status-proof-of-concept')<html.indexOf('<details'));
  assert.ok(html.includes('<details class="software-card-requirements">'));
  assert.ok(html.includes('Requirements and cost notes'));
  assert.ok(html.includes(item.software.accounts));
});
