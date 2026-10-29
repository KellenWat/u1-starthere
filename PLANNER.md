# Deterministic planner rules

M3 defines the seven brief inputs. M4's connected guide can supply explicit
answers, then ask only the relevant remaining questions. Enclosure matters
for ABS/ASA or noise/fume concerns; location for noise/fume concerns. The
remaining order is stage, materials, concerns, enclosure, comfort, location,
budget. Results expose every default and permit individual edits. Changing
an answer recomputes the same pure planner; no network service or ML is used.

## Inputs and defaults

Default to stock/assembled, PLA/PETG/TPU, no enclosure, $50, no selected bother,
no firmware/soldering comfort, and office. Stock/assembled and some-mods imply
bench preparation and assembly only; they never imply completed burn-in or
ownership of an unspecified mod. Already-on-Paxx12 also implies that firmware
is installed, but does not invent a stock-test history. Ownership defaults
are explicit `done_for_stages` metadata in items.json. Individual plan actions
can mark an item already done/fitted or request an optional item. Those edits
are refinements of the result, not additional intake questions.

An existing enclosure grants its reported capability, not a safety
certification. Exact DIY/official ownership is metadata; another enclosure
grants the capability without inventing an exact product. Track checks are
not silently imported as hardware ownership. Planner state lives in the URL
hash only; localStorage remains exclusive to track progress.

## Candidates and score

Account for every catalog record as planned, already done/fitted, excluded,
deferred by budget, or awaiting a quote. Hard conditions enforce material
compatibility, soldering comfort and firmware-install comfort. Prerequisites
whose hard conditions cannot be met block dependents with visible reasons.
Waiting days and minimum-firmware requirements produce warnings because the
intake does not establish those facts; they are never silently assumed true.

Contract 1.2.0 adds explicit optional/trigger conditions taken from the
checklist's optional accessories and "buy when a print demands it" guidance:
`materials_any`, `interests_any`, and `on_request`. A requested option or a
required dependency may bypass an interest/on-request trigger, but never a
material, firmware or soldering restriction. This prevents treating an
optional LED strip, display or spare cabinet as an automatic purchase.

Relevance score: 100 per selected bother match; 10 for a specific material
match (1 for general/all); 20 for a location match. Bother match is weighted
highest. Ties end with ascending item ID, using code-point comparison so
locale and input JSON order cannot change a plan.

## Dependencies, gates and alternatives

Expand required item IDs and capability providers. Existing owned items and
reported capabilities satisfy dependencies without duplicate purchases.
For new gates choose a compatible provider; true alternative routes cannot
coexist. Prefer higher relevance, then a known price within the budget, then
lower price and stable ID. The existing enclosure answer takes precedence
over recommending another route. Explain every excluded alternative by name.

Topological ordering uses prerequisite edges (including inserted gate edges).
Among ready items, use earlier phase, higher relevance, then stable ID.
Data can also state `after_selected` precedence for a follow-up habit: vibration
calibration waits until selected base/riser/cover changes. These edges order
work but do not require buying the referenced items. A deferred purchase
therefore cannot block a free follow-up to other selected changes.
Missing references and cycles fail explicitly rather than returning a
partial plan. A dependent whose prerequisite loses a conflict is visibly
blocked; it cannot remain in the usable sequence.

## Budget

Use integer cents. Greedily consider the sorted sequence. Include a step only
when its price fits and all required steps/capabilities are already satisfied.
Deferred prerequisites defer their dependents too. Unknown prices are never
zero: list them under "Needs a price quote" and block their dependents.

If a selected alternative/gate route is unaffordable after the earlier
stages, keep its budget deferral and recompute with the next compatible route.
This allows a cheaper lid when a preferred cover cannot fit. Earlier selected
purchases are never evicted to hide a prerequisite's cost. Each retry uses
the same ordering and greedy fill; retries are bounded by the item count.
If no route fits, the dependent remains visibly deferred. This is the
budget-sensitive enclosure choice called for by Q3/Q4, not a false conflict
between a heater and its required cooling.

Every step carries reason chips, conditions/warranty/source warnings, and
running cost/time. Optional related items remain optional and outside totals
unless explicitly added. Copy/print exports retain reasons, warnings, source
credits, budget deferrals, exclusions and unknown-price items.

## Verification

Five golden personas live in `tests/fixtures/planner-personas.json` and run
in CI alongside invariant and edge-case tests. URL state is versioned,
whitelisted, bounded and canonicalized. Reordering the JSON input must not
change the output. Generated `/plan/` is a committed static page; runtime
logic and all item content come from local modules and JSON.
