const DAY=86400000;
export function reviewState(record,now=new Date()){
  const value=record.last_verified,stamp=Date.parse(value+'T00:00:00Z');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value||'')||!Number.isFinite(stamp)||new Date(stamp).toISOString().slice(0,10)!==value)return 'unknown';
  const today=Date.parse(now.toISOString().slice(0,10)+'T00:00:00Z'),age=(today-stamp)/DAY;
  return age<0?'unknown':age>45?'due':'current';
}
export function reviewLabel(record,state='current'){
  const prefix=record.provenance?.verification_status==='source-reviewed-not-tested'?'Source reviewed':'Imported';
  const stamp=Date.parse(record.last_verified+'T00:00:00Z'),value=Number.isFinite(stamp)?new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(stamp)):'date unavailable';
  return `${prefix} ${value}${state==='due'?' · Review due':state==='unknown'?' · Check review date':''} · ${record.verified_firmware?'Firmware tested: '+record.verified_firmware:'Firmware: Not tested'}`;
}
export function mountFreshness(root=document){
  function refresh(){for(const badge of root.querySelectorAll('[data-review-date]')){
    const record={last_verified:badge.dataset.reviewDate,verified_firmware:badge.dataset.reviewFirmware||null,provenance:{verification_status:badge.dataset.reviewStatus}};
    const state=reviewState(record),text=reviewLabel(record,state);
    if(badge.textContent!==text)badge.textContent=text;
    badge.classList.toggle('review-due',state!=='current');
    const summary=badge.closest('.catalog-source')?.querySelector('summary');
    if(summary){const label=state==='due'?'Source & review — review due':state==='unknown'?'Source & review — check date':'Source & review';if(summary.textContent!==label)summary.textContent=label;}
  }}
  refresh();const observer=new MutationObserver(refresh);observer.observe(root.body||root,{childList:true,subtree:true});return ()=>observer.disconnect();
}
