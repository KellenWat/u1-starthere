// Deterministic keyword ranking. A match is navigation, never a diagnosis.
const ignored=new Set(['a','an','and','the','my','me','to','of','on','in','is','it','with','for','i']);
export const words=text=>(String(text).normalize('NFKD').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]).filter(word=>!ignored.has(word));
const phrase=text=>words(text).join(' ');
const stable=(a,b)=>a<b?-1:a>b?1:0;
export function searchFixes(fixes,query){
  if(!String(query).trim())return [...fixes].sort((a,b)=>stable(a.title,b.title)||stable(a.id,b.id)).map(card=>({card,score:0}));
  const tokens=[...new Set(words(query))],normalized=phrase(query);
  if(!tokens.length)return [];
  const indexed=fixes.map(card=>({card,phrases:[card.title,...card.symptoms,...card.codes].map(phrase),title:new Set(words(card.title)),tokens:new Set(words([card.title,...card.symptoms,...card.codes].join(' ')))}));
  return indexed.map(entry=>{
    const matches=tokens.filter(token=>entry.tokens.has(token));
    if(matches.length/tokens.length<.3)return {card:entry.card,score:0};
    let score=matches.reduce((sum,token)=>sum+100/(1+indexed.filter(other=>other.tokens.has(token)).length)+(entry.title.has(token)?12:0),0);
    score+=200*matches.length/tokens.length;
    if(entry.phrases.includes(normalized))score+=10000;
    else if(entry.phrases.some(text=>text.includes(normalized)))score+=2000;
    return {card:entry.card,score};
  }).filter(result=>result.score>0).sort((a,b)=>b.score-a.score||stable(a.card.id,b.card.id));
}
