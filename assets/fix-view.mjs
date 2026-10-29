import {escape as e,path,itemPath,date} from './view.mjs';
const safe=url=>String(url).startsWith('https://')?url:'#';
export function renderFix(card,items,base){
  const related=card.related_items.map(id=>items.find(item=>item.id===id)).filter(Boolean);
  return `<article class="fix-card" data-fix="${e(card.id)}" aria-labelledby="fix-title-${e(card.id)}">
    <header><span class="fix-severity severity-${e(card.severity)}">${e({info:'Information',caution:'Use with care',stop:'Stop condition applies'}[card.severity])}</span><h2 id="fix-title-${e(card.id)}">${e(card.title)}</h2><p class="fix-cause"><strong>Possible explanation</strong> ${e(card.likely_cause)}</p></header>
    <section class="fix-stop"><h3>Stop if</h3><p>${e(card.stop_if)}</p></section>
    <h3>What to check</h3><ol class="fix-steps">${card.steps.map(step=>`<li>${e(step)}</li>`).join('')}</ol>
    ${related.length?`<section class="fix-related"><h3>Related community options</h3><ul>${related.map(item=>`<li><a href="${e(itemPath(base,item.id))}">${e(item.title)}</a></li>`).join('')}</ul><p class="small">Check prerequisites before making a change.</p></section>`:''}
    <footer class="fix-evidence"><p>Source: <a href="${e(safe(card.source.url))}">${e(card.source.creator||'Creator credit pending')}</a></p><p>${e(card.source.note)}</p><p>${e(card.provenance.note)}</p><p>Imported/reviewed ${e(date(card.last_verified))}. ${card.verified_firmware?`Tested firmware: ${e(card.verified_firmware)}.`:'Firmware behavior not tested.'}</p><a class="text-link" href="${e(safe(card.support_url))}">Contact official U1 support</a><p>Curated data: <a href="${e(path(base,'data/LICENSE.md'))}">CC BY 4.0</a>. Original creator credit remains with the linked source.</p></footer>
  </article>`;
}
