import {escape as e,path,itemPath,date} from './view.mjs';
const safe=url=>String(url).startsWith('https://')?url:'#';
const codeList=(card,base,links=true)=>card.code_evidence?`<span class="fix-code-list">${card.codes.map(code=>links?`<a href="${e(path(base,'fixes/'))}?q=${encodeURIComponent(code)}"><code>${e(code)}</code></a>`:`<code>${e(code)}</code>`).join('')}</span>`:'';
export const renderFixSummary=card=>`<span class="fix-summary-content"><span class="fix-summary-title">${e(card.title)}</span>${card.code_evidence?`<span class="fix-code-label">Error codes</span>${codeList(card,'',false)}`:''}</span><span aria-hidden="true">+</span>`;
export function renderFix(card,items,base,{showCodes=true}={}){
  const related=card.related_items.map(id=>items.find(item=>item.id===id)).filter(Boolean);
  return `<article class="fix-card" data-fix="${e(card.id)}" aria-labelledby="fix-title-${e(card.id)}">
    <header><span class="fix-severity severity-${e(card.severity)}">${e({info:'Information',caution:'Use with care',stop:'Stop condition applies'}[card.severity])}</span><h2 id="fix-title-${e(card.id)}">${e(card.title)}</h2><p class="fix-cause"><strong>Possible explanation</strong> ${e(card.likely_cause)}</p></header>
    <section class="fix-stop"><h3>Stop if</h3><p>${e(card.stop_if)}</p></section>
    ${showCodes&&card.code_evidence?`<section class="fix-code-numbers"><h3>Associated error codes</h3>${codeList(card,base)}</section>`:''}
    <h3>What to check</h3><ol class="fix-steps">${card.steps.map(step=>`<li>${e(step)}</li>`).join('')}</ol>
    ${related.length?`<section class="fix-related"><h3>Related community options</h3><ul>${related.map(item=>`<li><a href="${e(itemPath(base,item.id))}">${e(item.title)}</a></li>`).join('')}</ul><p class="small">Check prerequisites before making a change.</p></section>`:''}
    ${card.code_evidence?`<details class="fix-codes"><summary>Code sources and review</summary><p class="small">Code mapping reviewed ${e(date(card.code_evidence.reviewed_at))}. Source reviewed; not tested on a printer.</p><p class="small">${e(card.code_evidence.note)}</p>${card.code_evidence.sources.map(source=>`<p class="small"><a href="${e(safe(source.url))}">${e(source.creator||'Creator credit pending')}</a> — ${e(source.note)}</p>`).join('')}</details>`:''}
    <footer class="fix-evidence"><p>Source: <a href="${e(safe(card.source.url))}">${e(card.source.creator||'Creator credit pending')}</a></p><p>${e(card.source.note)}</p><p>${e(card.provenance.note)}</p><p>Imported/reviewed ${e(date(card.last_verified))}. ${card.verified_firmware?`Tested firmware: ${e(card.verified_firmware)}.`:'Firmware behavior not tested.'}</p><a class="text-link" href="${e(safe(card.support_url))}">Contact official U1 support</a><p>Curated data: <a href="${e(path(base,'data/LICENSE.md'))}">CC BY 4.0</a>. Original creator credit remains with the linked source.</p></footer>
  </article>`;
}
