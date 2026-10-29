import {escape as e,path,itemCard} from './view.mjs';
import {encodeJourney} from './journey.mjs';

export function renderHome(items,phases,journey,base){
  const start=journey.nodes.find(node=>node.id===journey.start);
  const highlights=['printed-mod','firmware','slicer'].map(category=>items.find(item=>item.category===category)).filter(Boolean);
  return `<section class="home-launch" aria-labelledby="home-title">
    <h1 id="home-title">A clear next step for your U1.</h1>
    <p class="lead">From your first print to your next improvement.<br>Start with what you need.</p>
    <nav class="home-paths" aria-label="Choose your starting point">${start.choices.map(edge=>`<a class="home-path" href="${e(path(base,'plan/')+encodeJourney([edge.id]))}"><span>${e(edge.label)}</span>${edge.description?`<small>${e(edge.description)}</small>`:''}</a>`).join('')}</nav>
    <p class="quiet-note">A community guide. Free to use, with every source attached.</p>
    <p class="beta-note">Public beta. <a href="${e(path(base,'about/#feedback'))}">Help us spot a missing step.</a></p>
  </section>
  <section class="home-tools" aria-label="Quick ways to get help">
    <div class="home-start"><h2>Stock first. Mods second.</h2><p>Build a baseline before making changes.</p>
      <ol class="home-stages">${phases.slice(0,3).map(phase=>`<li><span class="phase-number">${phase.phase+1}</span><div><h3>${e(phase.name)}</h3><p>${e(phase.goal)}</p></div></li>`).join('')}</ol>
      <a class="text-link" href="${e(path(base,'start/'))}">Open the startup track</a>
    </div>
    <div class="home-search"><h2>A problem to solve?</h2><p>Go straight to a guide, or narrow it down in the connected map.</p>
      <form class="home-fix-search" action="${e(path(base,'fixes/'))}" role="search"><label for="home-symptom">Symptom or error code</label><div><input id="home-symptom" type="search" name="q" placeholder="Describe the problem or paste the full code"><button class="button primary" type="submit">Find a guide</button></div></form>
      <a class="text-link" href="${e(path(base,'fixes/'))}">Browse all fixes</a><p class="small">Keep a new printer stock while investigating a fault.</p>
    </div>
  </section>
  <section class="home-section"><div class="section-heading"><div><h2>Made useful by the community.</h2><p>Explore a few starting points. Follow the prerequisites and creator’s guide.</p></div><a class="text-link" href="${e(path(base,'catalog/'))}">Browse the catalog</a></div>
    <div class="catalog-grid">${highlights.map(item=>itemCard(item,phases,base)).join('')}</div>
  </section>`;
}
