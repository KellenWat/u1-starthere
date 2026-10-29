import {escape as e} from './view.mjs';

export const questions=[
  {name:'stage',title:'Where are you now?',help:'A general setup answer never assumes stock burn-in is complete.',options:[['not-arrived','My U1 hasn’t arrived'],['stock','Stock and assembled'],['mods','I have some mods'],['paxx12','Paxx12 is already installed']]},
  {name:'materials',title:'What do you want to print?',help:'This branch selects material prerequisites and relevant community options.',options:[['basic','PLA, PETG or TPU'],['abs','I’m curious about ABS or ASA'],['abrasive','Abrasive filaments, such as CF or GF'],['colors','Five or more colors']]},
  {name:'enclosure',title:'What enclosure do you have?',help:'An existing lid can satisfy an enclosure prerequisite. It does not establish safe temperatures or ventilation.',options:[['none','No enclosure'],['diy','A DIY lid'],['official','Official Top Cover'],['other','Another enclosure']]},
  {name:'budget',title:'What’s your next-month budget?',help:'Prices come from the catalog. Anything that does not fit stays visible as a deferral.',options:[[0,'$0 — free options'],[50,'About $50'],[150,'About $150'],[300,'About $300 or more']]},
  {name:'bothers',title:'What would you most like to improve?',help:'Choose up to two. You can leave this blank.',multiple:true,options:[['noise','Noise'],['fumes','Fumes'],['reliability','Reliability'],['speed-flow','Speed or flow'],['color-count','Color options'],['dry-filament','Dry filament']]},
  {name:'comfort',title:'How much tinkering suits you?',help:'Firmware and soldering restrictions also apply to prerequisites. Already-installed firmware can still expose its settings.',options:[['basic','No firmware changes or soldering'],['firmware','Firmware changes are OK'],['soldering','Firmware and soldering are OK']]},
  {name:'location',title:'Where does your U1 live?',help:'Location boosts relevant noise and fume options; it is not a ventilation assessment.',options:[['living-space','A desk in a living space'],['office','An office'],['garage-workshop','A garage or workshop']]}
];

// Every question is a connected, full-screen scene; later scenes are revealed on choice.
export function renderDecisionNodes(state){
  return questions.map((question,index)=>`<section class="decision-node" id="question-${index}" aria-labelledby="node-title-${index}" ${index?'hidden':''} tabindex="-1">
    <div class="node-inner">
      <div class="node-navigation"><button type="button" class="text-button" data-back="${index-1}" ${index?'':'hidden'}>Back</button><span>${index+1} of ${questions.length}</span></div>
      <header class="question-block"><h2 id="node-title-${index}">${e(question.title)}</h2></header>
      <p class="node-help" id="help-${index}">${e(question.help)}</p>
      <div class="node-options" role="group" aria-labelledby="node-title-${index}" aria-describedby="help-${index}">${question.options.map(([value,text])=>`<button type="button" class="choice-node" data-question="${question.name}" data-choice="${e(value)}" aria-pressed="${question.multiple?state.bothers.includes(value):String(state[question.name])===String(value)}"><span>${e(text)}</span><span class="choice-check" aria-hidden="true">✓</span></button>`).join('')}</div>
      ${question.multiple?`<button type="button" class="node-next" data-next-question="${index}">Continue <span data-concern-count>${state.bothers.length?'with '+state.bothers.length+' selected':'without a concern'}</span><span aria-hidden="true">↓</span></button>`:''}
      <button type="button" class="text-button node-skip" data-skip-question="${index}">Use current answer</button>
      <p class="node-answer" data-answer="${question.name}"></p>
    </div>
    <div class="node-connector" aria-hidden="true"><span>↓</span></div>
  </section>`).join('');
}

export function toggleConcern(current,value){
  if(current.includes(value))return current.filter(option=>option!==value);
  return current.length<2?[...current,value]:current;
}
