import {escape as e,path} from './view.mjs';
import {searchFixes,codeQuery} from './fix-search.mjs';
import {renderFix,renderFixSummary} from './fix-view.mjs';

export function mountFixes(main,fixes,items,base){
  const params=new URL(location.href).searchParams,initial=params.get('q')||'',selected=fixes.find(card=>card.id===params.get('card'));
  main.innerHTML=`<header class="page-heading fix-heading"><p class="intro-label">Find a useful next check</p><h1>What’s happening?</h1><p class="lead">Describe what your U1 is doing. These community guides offer possible explanations, ordered checks and clear stop conditions.</p></header>
    <form class="fix-search" role="search" aria-label="Search U1 symptoms and codes"><label for="fix-query">Search by symptom or error code</label><div><input id="fix-query" name="q" type="search" autocomplete="off" aria-describedby="fix-search-help" placeholder="Describe the problem or paste the full code" value="${e(initial)}"><button type="submit" class="button primary">Search</button></div><p id="fix-search-help" class="small">Use one complete code: four groups of four digits. Only documented exact matches return a code guide.</p></form>
    <p id="fix-count" class="small" role="status" aria-live="polite"></p><div id="fix-results"></div>
    <section class="fix-footer"><h2>Not sure where to start?</h2><a class="text-link" href="${e(path(base,'plan/'))}">Follow the connected guide</a><p class="small">A search match is not a confirmed diagnosis. New-machine faults belong with official support while the printer is stock.</p><a class="text-link" href="https://wiki.snapmaker.com/en/snapmaker_u1">Open official U1 guides</a></section>`;
  const input=main.querySelector('#fix-query');
  function update(first=false){
    const query=codeQuery(input.value);
    let results=searchFixes(fixes,input.value);
    if(first&&selected&&!input.value.trim())results=[{card:selected},...results.filter(result=>result.card.id!==selected.id)];
    main.querySelector('#fix-count').textContent=query.mode==='code'?`${results.length} documented exact code match${results.length===1?'':'es'} for ${query.code}.`:query.mode==='incomplete-code'?'Enter one complete error code to look it up.':input.value.trim()?`${results.length} matching guide${results.length===1?'':'s'}. Best keyword match first.`:`${fixes.length} community guides; ${fixes.reduce((sum,card)=>sum+card.codes.length,0)} documented codes. Source limitations are shown in each card.`;
    main.querySelector('#fix-results').innerHTML=results.length?results.map(({card},index)=>`<details class="fix-result" ${index===0&&(input.value.trim()||selected&&first)?'open':''}><summary>${renderFixSummary(card)}</summary>${renderFix(card,items,base,{showCodes:false})}</details>`).join(''):`<section class="empty-state"><h2>${query.mode==='code'?'This code is not mapped here yet':query.mode==='incomplete-code'?'Use the complete code':'No matching guide yet'}</h2><p>${query.mode==='symptom'?'Try a shorter description, follow the connected guide, or contact official support. No match does not mean the printer has no solution.':'We do not substitute a similar-looking code. Check the message against Snapmaker’s official reference or describe the symptom separately.'}</p><a class="text-link" href="https://wiki.snapmaker.com/en/snapmaker_u1/troubleshooting/u1_error_codes">Open official error-code reference</a><a class="text-link" href="${e(path(base,'plan/'))}">Help me narrow it down</a></section>`;
    const url=new URL(location.href);url.search='';if(input.value.trim())url.searchParams.set('q',input.value.trim());if(first&&selected)url.searchParams.set('card',selected.id);history.replaceState(null,'',url);
  }
  main.querySelector('form').addEventListener('submit',event=>{event.preventDefault();update();main.querySelector('#fix-results').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
  input.addEventListener('input',()=>update());update(true);
}
