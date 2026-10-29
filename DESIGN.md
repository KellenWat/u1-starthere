# M2 design direction

## Current iteration: interconnected community map

Use the four-toolhead printer's connected workflow as the visual structure:
one centered question, a thin branching rail, and floating choice nodes.
Canvas `#fbfbfd`, ink `#1d1d1f`, secondary `#626268`, rail `#d6d9e0`,
active blue `#0071e3`, pale selection `#edf5ff`. Keep system typography;
questions use a large unboxed headline, choices use quiet borders and only
the active choice receives depth. No decorative gradients or stock imagery.

```text
        Start → Improve → Filament
             What is happening?
                    |
           +--------+---------+
       [Recognizing]      [Drying]
             |               |
       shared question   relevant plan
             |
         existing fix → helped / next question / related options
```

Each decision fills the screen. A compact editable trail preserves context;
clicks reveal and scroll to the next node. Clear matches open fix guidance
without a planner questionnaire. Multiple entrances reuse shared nodes.
An overview exposes all connections, and URL state restores the chosen route.
The planner asks only relevant remaining intake questions and exposes defaults
for review. No match is not a diagnosis; offer search and official support.

Review: remove the boxed question, duplicate answer text and rigid seven-step
counter. The diagram expresses actual navigation rather than decorating a
fixed form. Keep full fix stop conditions, attribution and honest source status.
The dedicated /fixes surface uses the same cards and deterministic search.

The owner updated the visual direction during M3 to Apple/macOS-inspired.
The current theme below supersedes the original M2 typography and surface
treatment; the original rationale is retained as project history.

## Current theme: macOS-inspired (owner direction)

- Canvas `#f5f5f7`, near-white surfaces `#fbfbfd` / `#ffffff`, text
  `#1d1d1f`, secondary text `#626268`, links `#0066cc`, controls `#0071e3`.
- Apple system fonts when available, with native Segoe UI/sans-serif fallbacks.
  No font downloads, third-party assets or new dependencies.
- Frosted desktop toolbar, segmented navigation, soft white panels, rounded
  controls, restrained shadows and a blue app-style icon using our original
  four-toolhead mark. No fake window buttons or Apple branding.
- Phone navigation stays compact and does not pin a tall header over the
  questions. Desktop scroll targets account for the frosted toolbar height.
- Preserve semantic controls, focus visibility, contrast, ordinary scrolling,
  all planner behavior and the single small stylesheet.

U1 StartHere is a bench-side field guide: easy to read on a phone while a
printer is nearby. The visual reference is a printed setup guide with useful
tabs and a clear sequence, rather than a dashboard or store.

## Tokens

- Paper `#ffffff`; work surface `#f3f6fa`; ink `#243449`;
  blue `#2054c9`; pale blue `#e9f0ff`; caution `#ffefbf`.
- Display: Trebuchet MS with Segoe UI fallback, for a friendly, open shape.
  Reading and controls: Segoe UI / native sans serif. No downloaded fonts.
- Left-aligned text, body measure under 75 characters, generous line spacing.
  Borders separate steps; cards represent actual catalog items only.
- Restrained rounding: larger corners on the home track preview, smaller on
  controls, clean rows for checklist steps. No decorative shadows or motion.

## Layout

Home pairs a plain explanation and two useful actions with a data-rendered
preview of the opening phases. A four-toolhead mark is the single visual motif.

```text
brand                         Startup track  Catalog
What to do first.              first-week sequence
What to change next.           from phases.json
[Start the track] [Catalog]
selected first-week catalog entries, from items.json
official support link; symptom search noted as forthcoming
```

The catalog has labeled filters above a responsive grid. The track has a
progress meter followed by ordered, expandable phases and large checkboxes.
Detail pages give cost and effort first, then prerequisites, warnings and
creator attribution, with a clear way back to the catalog or track.

On phones, everything becomes one column; navigation stays visible without a
menu. Filter controls remain at least 44 px tall and checklist actions wrap.

## Review against the brief

Removed a generic metrics hero and decorative product cards: neither helps
an owner decide what to do by the printer. Kept numbering only for real
phases. No remote fonts, product photos, animation or extra runtime packages.
Data stays authoritative. M2 presents a catalog action until M3 actually
implements the planner, and an official support link until M4 implements
symptom search. Source/import status stays honest about missing verification.

## Agreed M3 direction

The owner requested an interactive, scrolling decision tree for the recurring
"what's next?" question. Use one skippable question at a time, retain earlier
answers, allow changes and backtracking, and branch toward relevant community
options with direct creator links. Use ordinary scrolling and keyboard
controls. Preserve the brief's deterministic planner, prerequisite/gate
ordering, visible conflicts, reason chips and budget deferrals underneath.
M3 implements this direction. The home page now links to the working planner.

## Current decision diagram (owner refinement)

Use a white canvas, ink `#1d1d1f`, secondary gray `#626268`, connector
gray `#c8c8ce`, and selection blue `#0071e3`. Retain native system typography.
Each question occupies at least one viewport. Center its question block above
connected rectangular choice nodes; the selected branch turns blue. Remove
the sidebar, accordion panels, shadows and large introductory copy here.

```text
                 [ Where are you now? ]
                           |
             +-------------+-------------+
        [ Stock U1 ]                 [ Some mods ]
             |
             v  select, reveal and scroll one screen
                 [ What will you print? ]
```

Earlier screens remain in the document for editing; a Back action returns to
the preceding node. Single choices advance immediately, including selecting
the current default. The concerns node allows up to two toggles, then an
explicit connected Next node (including none). Respect reduced motion and
move keyboard focus with the newly revealed question. Shared links open the
result with an Edit answers action. Keep the full credited output and exports.
This replaces generic cards with a diagram whose lines describe real choices.

## Previous M3 decision-path layout

Keep earlier answers as collapsed summaries and reveal the next question on
Continue/Skip. On desktop, a quiet sidebar previews relevant credited projects
as the answers change; on a phone, it follows the current question. Use the
same macOS-inspired control and panel system rather than drawing a separate
diagram UI. The numbered result sequence carries reason chips, prerequisite
links, visible conditions and running totals. Budget deferrals and unknown
prices are separate sections; other options remain inspectable. Exports use
a plain readable layout, without frosted surfaces or toolbar shadows on paper.
