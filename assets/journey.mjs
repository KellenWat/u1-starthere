import {normalizeState} from './planner.mjs';

export function edges(node){return node.kind==='fix'||node.kind==='resources'&&node.next?[{id:'next',label:node.kind==='resources'?'Explore another direction':'Continue',next:node.next}]:(node.choices||[]);}
export function walkJourney(data,choices,items){
  if(!Array.isArray(choices)||choices.length>40)throw new Error('Invalid journey length');
  const byId=new Map(data.nodes.map(node=>[node.id,node]));
  let node=byId.get(data.start),state=normalizeState({},items);const trail=[],answered=new Set();
  if(!node)throw new Error('Missing start node');
  for(const id of choices){
    const edge=edges(node).find(edge=>edge.id===id);
    if(!edge||!byId.has(edge.next))throw new Error('Unknown journey connection');
    trail.push({node,edge});
    for(const name of Object.keys(edge.set||{}))answered.add(name);
    state=normalizeState({...state,...edge.set},items);node=byId.get(edge.next);
    if(trail.some(entry=>entry.node.id===node.id))throw new Error('Repeated journey node');
  }
  return {node,state,trail,answered:[...answered]};
}
export function chooseJourney(data,choices,id,items){
  const current=walkJourney(data,choices,items),edge=edges(current.node).find(edge=>edge.id===id);
  if(!edge)throw new Error('Unknown journey choice');
  // Shared questions may link back. Return there rather than creating a loop.
  const previous=current.trail.findIndex(entry=>entry.node.id===edge.next);
  const next=previous<0?[...choices,id]:choices.slice(0,previous);
  walkJourney(data,next,items);return next;
}
export const encodeJourney=choices=>'#journey='+encodeURIComponent(JSON.stringify({v:1,choices}));
export function decodeJourney(hash,data,items){
  if(!hash)return {choices:[],valid:true};
  try{
    if(!hash.startsWith('#journey=')||hash.length>6000)throw new Error('Unknown journey link');
    const value=JSON.parse(decodeURIComponent(hash.slice(9)));
    if(value.v!==1)throw new Error('Unsupported journey version');
    walkJourney(data,value.choices,items);return {choices:value.choices,valid:true};
  }catch{return {choices:[],valid:false};}
}
