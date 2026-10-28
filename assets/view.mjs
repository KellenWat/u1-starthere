// Shared, dependency-free views. The authoring script uses these same views.
export const escape = value => String(value ?? '').replace(/[&<>"']/g, char =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const label = value => String(value).replaceAll('-', ' ').replace(/^./, char => char.toUpperCase());
export const money = value => value === null ? 'Price varies' : value === 0 ? 'Free' :
  new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:2}).format(value);
export const duration = minutes => minutes < 60 ? `${minutes} min` :
  `${Math.floor(minutes / 60)} hr${minutes % 60 ? ` ${minutes % 60} min` : ''}`;
export const date = value => value ? new Intl.DateTimeFormat('en-US',
  {month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${value}T00:00:00Z`)) : 'Not recorded';
export const path = (base, route = '') => `${String(base).replace(/\/$/, '')}/${route}`;
export const itemPath = (base, id) => path(base, `item/${encodeURIComponent(id)}/`);
export const difficulty = value => ['','Easy','Some setup','Hands-on','Advanced','Experimental'][value] || 'Review guide';
const safeLink = url => { try { return new URL(url).protocol === 'https:' ? url : '#'; } catch { return '#'; } };
const link = (href, text, attrs = '') => `<a href="${escape(href)}" ${attrs}>${escape(text)}</a>`;
const list = entries => `<ul class="plain-list">${entries.map(entry => `<li>${entry}</li>`).join('')}</ul>`;

export function catalogItems(items, filters = {}) {
  const query = (filters.q || '').trim().toLocaleLowerCase('en-US');
  return items.filter(item =>
    (!filters.category || item.category === filters.category) &&
    (!filters.phase || item.phase === Number(filters.phase)) &&
    (!filters.difficulty || item.difficulty <= Number(filters.difficulty)) &&
    (!filters.cost || (filters.cost === 'variable' ? item.cost_usd === null :
      item.cost_usd !== null && item.cost_usd <= Number(filters.cost))) &&
    (!query || [item.title, item.summary, item.source.creator || '', ...item.tags]
      .join(' ').toLocaleLowerCase('en-US').includes(query))
  ).sort((a,b) => a.phase - b.phase || a.title.localeCompare(b.title, 'en'));
}

export function itemCard(item, phases, base) {
  const phase = phases.find(phase => phase.phase === item.phase);
  return `<article class="item-card">
    <div class="card-kind"><span>${escape(label(item.category))}</span><span>${escape(label(item.type))}</span></div>
    <h3>${link(itemPath(base, item.id), item.title, 'class="card-link"')}</h3>
    <p class="card-summary">${escape(item.summary)}</p>
    <div class="card-facts"><strong>${escape(money(item.cost_usd))}</strong><span>${escape(duration(item.time_minutes))} estimated</span></div>
    <p class="card-stage">${escape(phase?.name || '')}<span aria-hidden="true"> / </span>${escape(difficulty(item.difficulty))}</p>
    <p class="card-credit">${escape(item.source.creator || 'Creator credit pending')}${item.warranty_risk !== 'none' ? '<span class="risk-note">Review warranty risk</span>' : ''}</p>
  </article>`;
}

function conditionNotes(item, items, base) {
  const c = item.conditions;
  const notes = [];
  if (c.min_stock_days) notes.push(escape(`Keep stock firmware for at least ${c.min_stock_days} days and finish clean stock tests first.`));
  if (c.firmware_min) notes.push(escape(`Minimum firmware in the source: ${c.firmware_min}. Confirm the current requirement before starting.`));
  if (c.requires_firmware) notes.push('This integration needs compatible extended firmware.');
  if (c.soldering) notes.push('Requires soldering skills and a complete installation guide.');
  if (c.matching_hotends) notes.push('Check the matching-hotend requirement for all heads used in the job.');
  if (c.excluded_materials?.length) notes.push(escape(`Unsuitable material route: ${c.excluded_materials.map(label).join(', ')}.`));
  for (const gate of c.required_gates || []) {
    const names = {enclosed:'an enclosure', 'chamber-heat-safe':'electronics cooling for chamber heating'};
    const providers = items.filter(provider => provider.gates.includes(gate));
    notes.push(`Needs ${escape(names[gate] || label(gate))}. Review a suitable route: ${providers.map(provider => link(itemPath(base,provider.id),provider.title)).join(', ')}.`);
  }
  return notes;
}

export function renderItem(item, items, phases, base) {
  const phase = phases.find(phase => phase.phase === item.phase);
  const references = (ids, empty) => ids.length ? list(ids.map(id => {
    const related = items.find(candidate => candidate.id === id);
    return link(itemPath(base,id), related?.title || id);
  })) : `<p>${escape(empty)}</p>`;
  const notes = conditionNotes(item, items, base);
  const status = item.provenance.verification_status === 'source-reviewed-not-tested' ? 'Source reviewed' : 'Imported from the seed';
  return `<div class="detail-nav">${link(path(base,'catalog/'),'Back to catalog')} ${link(path(base,`start/#phase-${item.phase}`),'View this stage in the track')}</div>
    <header class="detail-header"><p class="section-note">${escape(label(item.category))} / ${escape(phase?.name || '')}</p>
    <h1>${escape(item.title)}</h1><p class="lead">${escape(item.summary)}</p></header>
    <dl class="item-facts"><div><dt>Cost</dt><dd>${escape(money(item.cost_usd))}</dd></div>
    <div><dt>Estimated time</dt><dd>${escape(duration(item.time_minutes))}</dd></div>
    <div><dt>Difficulty</dt><dd>${escape(difficulty(item.difficulty))} <small>${item.difficulty} of 5</small></dd></div>
    <div><dt>Reversible</dt><dd>${item.reversible ? 'Usually, yes' : 'Review the guide'}</dd></div></dl>
    <div class="detail-columns"><div>
      <section class="detail-section"><h2>What to budget</h2><p>${escape(item.cost_note)}</p>
      ${item.price_checked_at ? `<p class="muted">Price recorded ${escape(date(item.price_checked_at))}. Check the seller before ordering.</p>` : ''}</section>
      <section class="detail-section"><h2>Before you start</h2>${references(item.requires,'No catalog prerequisites are listed. Check the source guide for the full requirements.')}${notes.length ? list(notes) : ''}</section>
      ${item.warnings.length || item.warranty_risk !== 'none' ? `<section class="callout caution"><h2>Read before changing anything</h2>${item.warranty_risk !== 'none' ? `<p><strong>Warranty risk: ${escape(label(item.warranty_risk))}.</strong> Review the current terms and the creator's guide.</p>` : ''}${list(item.warnings.map(escape))}</section>` : ''}
      ${item.conflicts.length ? `<section class="detail-section"><h2>Alternative routes</h2><p>Choose a suitable route rather than combining these alternatives.</p>${references(item.conflicts,'')}</section>` : ''}
      ${item.optional_related_items.length ? `<section class="detail-section"><h2>Optional next steps</h2><p>These are separate choices, not required purchases.</p>${references(item.optional_related_items,'')}</section>` : ''}
    </div><aside class="source-panel" aria-labelledby="source-heading"><h2 id="source-heading">Go to the source</h2>
      <p class="creator-name">${escape(item.source.creator || 'Original creator credit pending')}</p>
      ${link(safeLink(item.source.url), item.source.kind === 'model' ? "Open the creator's model page" : 'Open the source page', 'class="button primary"')}
      <p>${escape(item.source.note)}</p>
      <dl class="source-facts"><div><dt>${escape(status)}</dt><dd>${escape(date(item.last_verified))}</dd></div>
      <div><dt>Firmware tested</dt><dd>${escape(item.verified_firmware || 'Not tested')}</dd></div></dl>
      <p class="small">${escape(item.provenance.note)}</p><p class="small">We link to the original project. Its own license and instructions apply.</p>
    </aside></div>`;
}
