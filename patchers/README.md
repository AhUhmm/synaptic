# patchers/

Max patches. Open the project through `../synaptic.maxproj`, not the patches directly.

| File | Purpose |
| --- | --- |
| `main.maxpat` | **Top-level patch.** OSC input, prompt builder, generation gate, timers, status lights, display. Use presentation mode for operation. |
| `selezione.maxpat` | Maps a 0–1 value to a line of a fragment file (6 instances) |
| `textloader.maxpat` | Loads a `data/N.txt` file into a `text` object |
| `timedbangs.maxpat` | Sends *N* bangs every *M* ms: drives preview polling |
| `vz.mixfadr.maxpat` | Crossfader between consecutive images (Vizzie-derived, uses `code/xfade.genjit`) |
| `video-handler.maxpat`, `data-handler.maxpat`, `exact_menu.maxpat`, `vzgl-*.maxpat` | Vizzie internals used only by `vz.mixfadr.maxpat` |
| `n4m.monitor.maxpat` | Node for Max status monitor shown in `main.maxpat` |
| `shell/` | Third-party `shell` external (Windows `.mxe`/`.mxe64`, macOS `.mxo`) plus its help file. Used to open folders in Explorer. |
