# code/

Scripts loaded by the Max patches.

| File | Loaded by | Purpose |
| --- | --- | --- |
| `sd_comm_img_3_chat.js` | `node.script` in `main.maxpat` | **Active bridge to Stable Diffusion.** Sends prompts to the WebUI API, polls previews, saves PNGs to `media/` and returns their paths to Max. All inference parameters (steps, CFG, formats, checkpoint, port) are set here. |
| `xfade.genjit` | `vz.mixfadr.maxpat` | Gen shader for the crossfade between images |
| `vizzie-global.js` | `vzgl-object.maxpat` | Vizzie helper for GL modules |
| `vizzie-datatexconvert.js` | `data-handler.maxpat` | Vizzie data ↔ texture conversion |
| `fit_jweb_to_bounds.js`, `resize_n4m_monitor_patcher.js` | `n4m.monitor.maxpat` | Layout helpers for the Node for Max monitor |

`node.script` runs with `@watch 1`: saving `sd_comm_img_3_chat.js` restarts it automatically. Earlier versions of the bridge script are in `../_archive/code/`.
