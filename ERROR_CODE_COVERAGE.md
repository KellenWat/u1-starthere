# Error-code-to-fix coverage

Reviewed 2026-10-29. This is a selected lookup for the fault families raised in
the owner checklist and community notes. It does not claim to cover every U1
error. All 37 codes are explicitly stored in `data/fixes.json`; there is no
runtime wildcard expansion. Firmware behavior has not been tested.

| Guide | Explicit codes | Count | Procedure source |
|---|---|---:|---|
| Maintenance reminder | `0001-0523-0000-0037` | 1 | [Core maintenance](https://wiki.snapmaker.com/en/snapmaker_u1/troubleshooting/Core_Components_Maintenance_Guide) |
| Pogo contact fault | `0002-0523-0000-0045` through `0002-0523-0003-0045` | 4 | [Contact anomaly](https://wiki.snapmaker.com/en/snapmaker_u1/troubleshooting/pogopin_contact_anomaly) |
| Homing anomaly | `0002-0528-0000-0011`, `0002-0528-0000-0012` | 2 | [Homing guide](https://wiki.snapmaker.com/en/snapmaker_u1/troubleshooting/U1_homing_failure) |
| Calibration obstruction/residue | `0003-0530-0000-0008`, `0003-0530-0001-0008`, `0003-0530-0002-0008` | 3 | [Calibration guide](https://wiki.snapmaker.com/en/snapmaker_u1/troubleshooting/u1_calibration_anomaly) |
| Loading / runout sensor | `0002-0525-0000-0032` through `0002-0525-0003-0032` | 4 | [Loading anomaly](https://wiki.snapmaker.com/en/snapmaker_u1/troubleshooting/Filament_loading_Anomaly) |
| Printing / filament feed | `0002-0523-0000-0038` through `0002-0523-0003-0038` | 4 | [Printing anomaly](https://wiki.snapmaker.com/en/snapmaker_u1/troubleshooting/printing_anomaly) |
| Toolhead 2 pick/park | `0002-0523-0001-0021` through `0002-0523-0001-0035` | 15 | [Toolhead 2 picking guide](https://wiki.snapmaker.com/en/snapmaker_u1/troubleshooting/u1_toolhead_2_picking_failure) |
| Seated head reported detached | `0002-0523-0000-0040` through `0002-0523-0003-0040` | 4 | [Dock detection guide](https://wiki.snapmaker.com/en/snapmaker_u1/troubleshooting/toolhead_detached) |

The [official reference table](https://wiki.snapmaker.com/en/snapmaker_u1/troubleshooting/u1_error_codes)
was checked for exact associations. The Toolhead 2 article explicitly lists
all 15 codes; those were not extrapolated to the other heads. Calibration
submodules concern axes here, so the UI does not guess toolhead numbers.

The original brief's `…0045` example was attached to the reminder card.
Review corrected that association to a distinct contact-fault card. The
`…0037` notice uses maintenance guidance, including keeping grease off contacts.
Loading `…0032` guidance includes a possible damaged runout-sensor cable after
assembly; it is not labelled as proof of a clog or an inevitable sensor failure.

The [homing discussion](https://forum.snapmaker.com/t/u1-homing-anomaly-0002-0528-0000-0011/40742)
credits edstewbob, 0rfar and ni42 in the data. Reports about centering with
power off conflict in outcome and concern earlier firmware. Preserve that
limitation; no firmware patch, sensor bypass or wiring modification is proposed.

Original StartHere summaries are rewrites. Linked guides retain their creators'
rights; no images, documents, G-code, firmware or model files are rehosted.
