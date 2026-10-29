import {escape as e,label,money,itemPath,renderReview} from './view.mjs';

export function groupCatalog(items,definitions){
  definitions??=[...new Set(items.map(item=>item.category))].sort().map(category=>({id:category,title:label(category),description:'',categories:[category]}));
  const groups=definitions.map(group=>({...group,items:[]}));
  for(const item of items){
    const matches=groups.filter(group=>group.categories.includes(item.category));
    if(matches.length!==1)throw new Error('Each catalog item needs exactly one section.');
    matches[0].items.push(item);
  }
  return groups.filter(group=>group.items.length);
}

export function catalogEntry(item,base){
  return `<article class="catalog-entry"><h3><a href="${e(itemPath(base,item.id))}">${e(item.title)}</a></h3><p class="catalog-entry-summary">${e(item.summary)}</p><div class="catalog-entry-facts"><strong>${e(money(item.cost_usd))}</strong><span>${e(label(item.type))}</span>${item.software?`<span class="software-status status-${e(item.software.status)}">${e(label(item.software.status))}</span>`:''}${item.warranty_risk!=='none'?'<span class="catalog-requirements">Check requirements</span>':''}</div><details class="catalog-source"><summary>Source &amp; review</summary><p>${e(item.source.creator||'Creator credit pending')}</p>${renderReview(item)}<a class="text-link" href="${e(itemPath(base,item.id))}">Full guide and requirements</a></details></article>`;
}

export function renderCatalog(items,definitions,base,{filtered=false}={}){
  const groups=groupCatalog(items,definitions);
  if(!groups.length)return '<div class="empty-state"><h2>No items match these filters</h2><p>Try a broader category, cost or stage.</p><button class="button secondary" type="button" id="empty-reset">Clear filters</button></div>';
  return `<nav class="catalog-index" aria-label="Catalog sections">${groups.map(group=>`<a href="#catalog-group-${e(group.id)}" data-catalog-jump="${e(group.id)}">${e(group.title)} <span>${group.items.length}</span></a>`).join('')}</nav><div class="catalog-sections">${groups.map((group,index)=>`<details class="catalog-section" id="catalog-group-${e(group.id)}" ${filtered||index===0?'open':''}><summary><h2><span>${e(group.title)}</span><small>${group.items.length} ${group.items.length===1?'item':'items'}</small><span class="catalog-disclosure" aria-hidden="true">+</span></h2></summary><p class="catalog-section-description">${e(group.description)}</p><div class="catalog-entry-grid">${group.items.map(item=>catalogEntry(item,base)).join('')}</div></details>`).join('')}</div>`;
}
