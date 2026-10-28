// Optional authoring tool; generated HTML is committed and served as-is.
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {escape,renderItem} from '../assets/view.mjs';
const root = new URL('../',import.meta.url), check = process.argv.includes('--check');
const read = path => readFile(new URL(path,root),'utf8');
const [{items},{phases},template] = await Promise.all([read('data/items.json').then(JSON.parse),read('data/phases.json').then(JSON.parse),read('templates/page.html')]);
const pages = [
  {file:'index.html',page:'home',base:'./',title:'U1 StartHere — A good first week starts stock',description:'A clear startup track and credited catalog for Snapmaker U1 owners.'},
  {file:'catalog/index.html',page:'catalog',base:'../',title:'Catalog — U1 StartHere',description:'Browse U1 setup, printed mods, purchases and settings by cost, difficulty and stage.'},
  {file:'start/index.html',page:'start',base:'../',title:'Startup track — U1 StartHere',description:'Work through your U1 setup, stock tests, first mods and tuning at your own pace.'},
  ...items.map(item=>({file:`item/${item.id}/index.html`,page:'item',base:'../../',title:`${item.title} — U1 StartHere`,description:item.summary,content:renderItem(item,items,phases,'../..')}))
];
let stale = 0;
for (const page of pages) {
  const values = {...page,content:page.content || '<p class="loading" role="status">Loading your field guide…</p><noscript><h1>JavaScript is needed for this page</h1><p>Enable JavaScript for the interactive catalog and track. Individual item pages remain readable without it.</p></noscript>', 'active-start':page.page==='start'?'aria-current="page"':'','active-catalog':page.page==='catalog'?'aria-current="page"':''};
  const html = template.replace(/\{\{([a-z-]+)\}\}/g,(_,key)=>['content','active-start','active-catalog'].includes(key)?values[key]:escape(values[key])).replace(/[\t ]+$/gm,'');
  const target = new URL(page.file,root);
  if (check) { if (await read(page.file).catch(()=>null) !== html) { console.error(`STALE ${page.file}`); stale++; } }
  else { await mkdir(new URL('./',target),{recursive:true}); await writeFile(target,html); }
}
for (const name of await readdir(new URL('item/',root)).catch(()=>[])) if (!items.some(item=>item.id===name)) { console.error(`Orphan item page: ${name}`); stale++; }
if (stale) process.exitCode=1;
else console.log(`${check?'PASS generated pages match JSON and template:':'Generated'} ${pages.length} HTML pages (${items.length} item details).`);
