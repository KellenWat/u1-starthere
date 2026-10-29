# Software coverage review

Reviewed against creator repositories and the Paxx12 integration documentation on 2026-10-28. This fills the gaps identified after M4; it is not a claim to enumerate every community project.

The catalog now contains 63 items: 25 new source-reviewed guides and 6 existing entries with structured software information (31 classified software/integration guides). Eight goal-based resource groups connect them to Explore, Improve and the installed-firmware branch.

All new guides are optional requests. A source review is not a hardware or firmware compatibility test; `verified_firmware` remains null. Original seed prices and dates are preserved. Unknown hardware/service/platform costs stay quoted rather than becoming $0.

## Added guides

| Guide | Kind | Status | Runs on | Creator/source |
| --- | --- | --- | --- | --- |
| HelixScreen touchscreen interface | plugin | experimental | printer | [Preston Brown and HelixScreen contributors; Paxx12 integration](https://snapmakeru1-extended-firmware.pages.dev/helixscreen) |
| OctoEverywhere cloud access | plugin | experimental | printer, browser | [OctoEverywhere contributors; Paxx12 integration](https://snapmakeru1-extended-firmware.pages.dev/cloud) |
| SpoolLink companion apps | companion-app | proof-of-concept | android, ios, browser | [Paxx12](https://github.com/paxx12-snapmaker-u1/spool-link-apps) |
| SpoolPainter | companion-app | documented | android | [ni4223](https://github.com/ni4223/SpoolPainter) |
| SpoolKid | companion-app | beta | ios | [marko-p / Marco](https://github.com/marko-p/SpoolKid) |
| SpoolTagger | companion-app | documented | windows, linux | [NiftyBits](https://codeberg.org/NiftyBits/SpoolTagger) |
| 3DMRP print-farm management | companion-app | documented | windows, browser | [MKloberg](https://github.com/MKloberg/3dmrp) |
| Spool Studio | companion-app | documented | android | [GeorgHo](https://github.com/GeorgHo/SpoolStudio) |
| OpenRFID filament detection | integration | experimental | printer | [suchmememanyskill; Paxx12 integration](https://github.com/suchmememanyskill/OpenRFID) |
| wasikuss remote RFID reader | hardware-integration | experimental | external-device | [wasikuss](https://github.com/wasikuss/snapmaker-u1-remote-rfid-reader) |
| baze drybox NFC reader | hardware-integration | experimental | external-device | [baze](https://gitlab.com/baze/snapmaker-u1-drybox-nfc-reader) |
| Moonraker for Home Assistant | integration | unmaintained | browser, linux, windows, macos | [marcolivierarsenault and contributors](https://github.com/marcolivierarsenault/moonraker-home-assistant) |
| Klipper metrics exporter | integration | documented | printer, browser | [scross01 and contributors; Paxx12 integration](https://github.com/scross01/prometheus-klipper-exporter) |
| Custom Klipper and Moonraker includes | advanced-config | documented | printer | [Paxx12 contributors](https://snapmakeru1-extended-firmware.pages.dev/klipper_includes) |
| Klipper print lifecycle hooks | advanced-config | documented | printer | [Paxx12 contributors](https://snapmakeru1-extended-firmware.pages.dev/klipper_hooks) |
| Adaptive mesh object processing | advanced-config | experimental | printer | [Paxx12 contributors](https://snapmakeru1-extended-firmware.pages.dev/tweaks#object-processing-for-adaptive-mesh) |
| Experimental motion and TMC tweaks | advanced-config | experimental | printer | [Paxx12 contributors; JNP-1 motion values](https://snapmakeru1-extended-firmware.pages.dev/tweaks) |
| AFC-Lite status interface | firmware-feature | experimental | printer, browser | [Paxx12 contributors](https://snapmakeru1-extended-firmware.pages.dev/afc-lite) |
| Extended-firmware timelapse support | firmware-feature | documented | printer, browser | [Paxx12 contributors](https://snapmakeru1-extended-firmware.pages.dev/camera_support#timelapse-support) |
| U1 timelapse recovery tool | companion-app | documented | windows, macos, linux | [horzadome](https://github.com/horzadome/snapmaker-u1-timelapse-recovery) |
| Remote touchscreen view | firmware-feature | documented | printer, browser | [Paxx12 contributors](https://snapmakeru1-extended-firmware.pages.dev/remote_screen) |
| Choose Fluidd or Mainsail | firmware-feature | documented | printer, browser | [Fluidd and Mainsail contributors; Paxx12 integration](https://snapmakeru1-extended-firmware.pages.dev/firmware_config) |
| PrintTag-Web | companion-app | documented | android, browser | [Paxx12](https://github.com/paxx12/PrintTag-Web) |
| U1-RFID app | companion-app | documented | android | [DnG-Crafts](https://github.com/DnG-Crafts/U1-RFID) |
| OpenSpool mobile app | companion-app | documented | android, ios | [spuder and contributors](https://github.com/spuder/OpenSpoolMobile) |

## Evidence and limits

- Each record embeds creator credit, documentation links, platform/firmware/account/hardware requirements, project-license notes, an original setup outline and source-review provenance. The data is in items.json; generated detail HTML and live views consume it.
- SpoolLink is explicitly an unstable proof of concept. Its iOS build has a paid developer/NFC requirement; the record uses a variable cost.
- The linked Home Assistant integration is marked unmaintained by its author. It is documented for discovery, not automatically recommended.
- SpoolKid is currently a TestFlight beta. The public repository is an older snapshot; current development is private. Do not imply the current beta is all published under the snapshot license.
- The Codeberg SpoolTagger repository could not be fetched, and the GitLab drybox-reader page did not expose readable documentation. Their records link to the creators and disclose that the firmware directory supplied the platform/integration details.
- External-reader variants and tag formats are not interchangeable. The guides preserve limitations and point to the creator’s matching branch and the U1 reader comparison.
- The original firmware, hardware and compatibility limitations remain. No third-party files are hosted, no plugin is installed by this site, and no source review advances an existing tested-firmware claim.

## User-requested review and second iteration

The first desktop/phone review found seven tall inventory cards, no platform filtering, and catalog cards that hid software status. At 390×844 the first comparison card measured 806 px high.

The second iteration moved requirements/cost notes into native expandable sections, kept kind/status/platform badges visible, added a platform filter to resource groups and a Software & integrations category plus platform filter to the catalog. The same first card measured 496 px afterward (about 38% shorter). Selecting iOS narrowed seven inventory options to SpoolLink and SpoolKid.

Compatibility details remain in the expanded card and full guide; external account/hardware requirements are not silently omitted. The SpoolLink cost correction avoids labeling a platform-dependent setup as unconditionally free.

## Milestone scope

This is an owner-authorized content and usability iteration after M4. M5 embed/freshness/About work and M6 submission assets remain deferred. Test and browser results are recorded in SOFTWARE_VALIDATION.md.
