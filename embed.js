/* U1 StartHere embed — MIT. Data and creator credits retain their own license. */
(()=>{
  'use strict';
  const script=document.currentScript,base=new URL('./',script.src);
  let catalog;
  const current=new WeakMap();
  const load=()=>catalog||(catalog=fetch(new URL('data/items.json',base),{credentials:'omit',referrerPolicy:'no-referrer'}).then(response=>{if(!response.ok)throw new Error('Data unavailable');return response.json();}));
  const safe=value=>{try{return new URL(value).protocol==='https:'?value:'#';}catch{return '#';}};
  function node(tag,text){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;}
  function anchor(text,url){const el=node('a',text);el.href=url;return el;}
  async function render(target,id){
    const generation={};current.set(target,generation);
    const root=target.shadowRoot||target.attachShadow({mode:'open'});root.replaceChildren();
    const style=node('style',' :host{display:block;font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#202124}article{border:1px solid #8b929d;border-radius:12px;padding:22px;background:#fff}h3{font-size:1.25em;margin:0 0 12px}p{margin:0 0 12px}a{color:#0069d9;text-underline-offset:.2em;display:inline-block;min-height:44px;line-height:44px}a:focus-visible{outline:3px solid #1742a4;outline-offset:3px}small{display:block;color:#5f636b}');
    root.append(style);const card=node('article');root.append(card);card.append(node('p','Loading U1 guide…'));card.setAttribute('aria-live','polite');
    try{
      const data=await load();if(current.get(target)!==generation)return;if(data.license!=='CC-BY-4.0')throw new Error('Unknown data license');
      const item=data.items.find(item=>item.id===id);if(!item)throw new Error('Unknown item');card.replaceChildren();
      const heading=node('h3');heading.append(anchor(item.title,new URL('item/'+encodeURIComponent(item.id)+'/',base).href));card.append(heading,node('p',item.summary));
      card.append(node('p',item.cost_note));
      card.append(node('small','Creator: '+(item.source.creator||'Credit pending')));
      card.append(node('small',(item.provenance.verification_status==='source-reviewed-not-tested'?'Source reviewed ':'Imported ')+item.last_verified+'; '+(item.verified_firmware?'firmware tested: '+item.verified_firmware:'firmware not tested')+'.'));
      if(Math.floor(Date.now()/86400000)-Math.floor(Date.parse(item.last_verified+'T00:00:00Z')/86400000)>45)card.append(node('small','Source review due.'));
      if(item.warnings.length)card.append(node('p',item.warnings[0]));
      card.append(anchor('Creator’s source',safe(item.source.url)),node('br'),anchor('Full requirements and warnings',new URL('item/'+encodeURIComponent(item.id)+'/',base).href),node('br'),anchor('U1 StartHere data · CC BY 4.0',new URL('data/LICENSE.md',base).href));
    }catch{if(current.get(target)===generation)card.replaceChildren(node('p','This U1 guide could not load. Check the item ID or try again.'),anchor('Browse U1 StartHere',new URL('catalog/',base).href));}
  }
  window.U1StartHere={render};
  const scan=()=>document.querySelectorAll('[data-u1-item]').forEach(target=>render(target,target.dataset.u1Item));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});else scan();
})();
