# data/

Content and saved settings.

| File | Purpose |
| --- | --- |
| `1.txt` … `6.txt` | Prompt fragments, one file per sensor. One line per option, ordered from the lowest (0) to the highest (1) sensor value. Each line ends with `, `. Mapping: `1` vegetation (EMG 2), `2` land and water (soil), `3` sky (temperature), `4` atmosphere (humidity), `5` time of day (light), `6` technology + LoRA tags (EMG 1). |
| `settings.json` | `pattrstorage settings` snapshot: preview timing, OSC port, Timed Prompt interval, crossfade speed |
| `package.json` | Leftover npm manifest from the first script version. Not used at runtime. |

Any number of lines per file works: the selector reads the line count at load.
