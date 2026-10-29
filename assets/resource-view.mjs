import {escape as e,path,itemPath,softwareCard,platformLabel,renderReview} from './view.mjs';
const safeLink=url=>{try{return new URL(url).protocol==='https:'?url:'#';}catch{return '#';}};

export function renderResources(node,items,base){
  const options=node.item_ids.map(id=>items.find(item=>item.id===id));
  const software=options.every(item=>item.software);
  const platforms=[...new Set(options.flatMap(item=>item.software?.platforms||[]))].sort();
  const cards=software?options.map(item=>softwareCard(item,base)):options.map(item=>printCard(item,items,base));
  return `<div class="journey-resources"><header><h2 id="journey-title">${e(node.title)}</h2><p class="lead">${e(node.help)}</p></header>${software?`<div class="software-filter"><div><label for="software-platform">Runs on</label><select id="software-platform"><option value="">Any platform</option>${platforms.map(value=>`<option value="${e(value)}">${e(platformLabel(value))}</option>`).join('')}</select></div><p id="software-count" role="status" aria-live="polite">${options.length} options</p><a href="${e(path(base,'catalog/?category=software'))}">All software guides</a></div>`:''}<div class="software-grid" id="${software?'software-results':'print-results'}">${cards.join('')}</div><button type="button" class="button secondary" data-edge="next">Explore another direction</button></div>`;
}

export function printCard(item,items,base){
  return `<article class="software-card print-card"><h3><a href="${e(itemPath(base,item.id))}">${e(item.title)}</a></h3><p>${e(item.summary)}</p><p class="software-credit">${e(item.source.creator||'Designer credit pending')}. Physical fit not tested.</p>${renderReview(item)}<div class="software-actions"><a class="button primary" href="${e(safeLink(item.source.url))}">Open creator’s model</a><a class="text-link" href="${e(itemPath(base,item.id))}">Details and source notes</a></div><details class="software-card-requirements"><summary>Fit and cost notes</summary><p class="small">${e(item.cost_note)}</p><p class="small"><strong>Before fitting:</strong> ${item.requires.map(id=>`<a href="${e(itemPath(base,id))}">${e(items.find(candidate=>candidate.id===id)?.title||id)}</a>`).join(', ')}</p>${item.community_evidence?.length?`<ul>${item.community_evidence.map(source=>`<li><a href="${e(safeLink(source.url))}">${e(source.note)}</a> <small>${e(source.creator||'Credit pending')}</small></li>`).join('')}</ul>`:''}<ul>${item.warnings.map(note=>`<li>${e(note)}</li>`).join('')}</ul></details></article>`;
}
