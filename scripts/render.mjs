// Optional authoring tool; generated HTML is committed and served as-is.
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {escape,renderItem} from '../assets/view.mjs';
const root = new URL('../',import.meta.url), check = process.argv.includes('--check');
const read = path => readFile(new URL(path,root),'utf8');
const [{items},{phases},template] = await Promise.all([read('data/items.json').then(JSON.parse),read('data/phases.json').then(JSON.parse),read('templates/page.html')]);
const pages = [
  {file:'index.html',page:'home',base:'./',title:'U₁ StartHere — A clear next step for your U1',description:'Find your next step, follow the startup track and explore sourced community fixes and projects for Snapmaker U1.'},
  {file:'catalog/index.html',page:'catalog',base:'../',title:'Catalog — U₁ StartHere',description:'Browse U1 setup, printed mods, purchases and settings by cost, difficulty and stage.'},
  {file:'start/index.html',page:'start',base:'../',title:'Startup track — U₁ StartHere',description:'Work through your U1 setup, stock tests, first mods and tuning at your own pace.'},
  {file:'plan/index.html',page:'plan',base:'../',title:'What’s next? — U₁ StartHere',description:'Follow a scrolling decision path to a deterministic, priced U1 plan with prerequisites and credited community sources.'},
  {file:'fixes/index.html',page:'fixes',base:'../',title:'Fixes — U₁ StartHere',description:'Search U1 symptoms or documented error codes for sourced checks and explicit stop conditions.'},
  {file:'about/index.html',page:'about',base:'../',title:'About and feedback — U₁ StartHere',description:'How StartHere credits sources, handles review dates, protects privacy and gathers owner feedback.',content:await read('content/about.html')},
  {file:'embed/index.html',page:'embed',base:'../',title:'Embed and open data — U₁ StartHere',description:'Embed a credited U1 item card or reuse the public CC BY 4.0 JSON data.',content:await read('content/embed.html')},
  ...items.map(item=>({file:`item/${item.id}/index.html`,page:'item',base:'../../',title:`${item.title} — U₁ StartHere`,description:item.summary,content:renderItem(item,items,phases,'../..')}))
];
let stale = 0;
for (const page of pages) {
  const values = {...page,content:page.content || '<p class="loading" role="status">Loading your field guide…</p><noscript><h1>JavaScript is needed for this page</h1><p>Enable JavaScript for the interactive catalog, planner and track. Individual item pages remain readable without it.</p></noscript>', ...Object.fromEntries(['start','plan','catalog','fixes'].map(name=>[`active-${name}`,page.page===name?'aria-current="page"':'']))};
  const html = template.replace(/\{\{([a-z-]+)\}\}/g,(_,key)=>key==='content'||key.startsWith('active-')?values[key]:escape(values[key])).replace(/[\t ]+$/gm,'');
  const target = new URL(page.file,root);
  if (check) { if (await read(page.file).catch(()=>null) !== html) { console.error(`STALE ${page.file}`); stale++; } }
  else { await mkdir(new URL('./',target),{recursive:true}); await writeFile(target,html); }
}
for (const name of await readdir(new URL('item/',root)).catch(()=>[])) if (!items.some(item=>item.id===name)) { console.error(`Orphan item page: ${name}`); stale++; }
if (stale) process.exitCode=1;
else console.log(`${check?'PASS generated pages match JSON and template:':'Generated'} ${pages.length} HTML pages (${items.length} item details).`);
