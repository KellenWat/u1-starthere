import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {setImmediate} from 'node:timers/promises';
const source=await readFile(new URL('../embed.js',import.meta.url),'utf8');
const data=JSON.parse(await readFile(new URL('../data/items.json',import.meta.url),'utf8'));
class Element{
  constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.attributes={};this.value='';}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.value='';this.children=children;}
  setAttribute(name,value){this.attributes[name]=value;}
  set textContent(value){this.value=value;this.children=[];}
  get textContent(){return this.value+this.children.map(child=>child.textContent).join('');}
  attachShadow(){return this.shadowRoot=new Element('shadow');}
}
const nodes=root=>[root,...root.children.flatMap(nodes)];
async function run(ids,response=data,fail=false){
  const targets=ids.map(id=>{const target=new Element('div');target.dataset.u1Item=id;return target;});
  const calls=[],window={};
  const document={currentScript:{src:'https://example.github.io/u1-starthere/embed.js'},readyState:'complete',createElement:tag=>new Element(tag),querySelectorAll:()=>targets};
  const fetch=async(url,options)=>{calls.push({url:String(url),options});if(fail)throw new Error('network');return {ok:true,json:async()=>response};};
  vm.runInNewContext(source,{window,document,fetch,URL,Date,WeakMap});await setImmediate();
  return {targets,calls,window};
}
test('embed shares one credential-free fetch and keeps creator/license links under the project prefix',async()=>{
  const {targets,calls}=await run(['stock-burn-in-complete','elegant-spool-holder']);
  assert.equal(calls.length,1);assert.equal(calls[0].url,'https://example.github.io/u1-starthere/data/items.json');
  assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.referrerPolicy,'no-referrer');
  for(const [index,target] of targets.entries()){
    const item=data.items.find(item=>item.id===['stock-burn-in-complete','elegant-spool-holder'][index]);
    const all=nodes(target.shadowRoot),text=target.shadowRoot.textContent;
    assert.ok(text.includes(item.source.creator)&&text.includes('CC BY 4.0'));
    assert.ok(text.includes(item.last_verified)&&text.includes('firmware not tested'));
    assert.ok(all.some(node=>node.href==='https://example.github.io/u1-starthere/item/'+item.id+'/'));
  }
});
test('embed shows an actionable fallback for unknown IDs and network failure',async()=>{
  for(const result of [await run(['unknown']),await run(['stock-burn-in-complete'],data,true)]){
    assert.ok(result.targets[0].shadowRoot.textContent.includes('could not load'));
    assert.ok(nodes(result.targets[0].shadowRoot).some(node=>node.href==='https://example.github.io/u1-starthere/catalog/'));
  }
});
test('embed treats imported markup as text and blocks unsafe source schemes',async()=>{
  const bad=structuredClone(data);bad.items[0].title='<img onerror=bad()>';bad.items[0].source.url='javascript:bad()';
  const {targets}=await run([bad.items[0].id],bad),all=nodes(targets[0].shadowRoot);
  assert.ok(all.some(node=>node.textContent==='<img onerror=bad()>'));
  assert.ok(!all.some(node=>node.tag==='img'||node.href?.startsWith('javascript:')));
});
test('explicit render replaces the card without duplicate nodes',async()=>{
  const {targets,window}=await run(['stock-burn-in-complete']);
  await window.U1StartHere.render(targets[0],'elegant-spool-holder');
  const all=nodes(targets[0].shadowRoot);
  assert.equal(all.filter(node=>node.tag==='article').length,1);
  assert.ok(targets[0].shadowRoot.textContent.includes('Elegant spool holder'));
});
