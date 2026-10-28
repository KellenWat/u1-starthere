# M2 design direction

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
The M2 home page introduces this direction; its engine starts only in M3.
