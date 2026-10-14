# Synaptic Dialogues — Reinstallation Guide

Step-by-step guide for setting up the image-generation system of **_Synaptic Dialogues_** (Emidio Battipaglia) on a new Windows PC, including a PC with a less powerful graphics card than the original one.

For how the system works internally, see the [technical documentation](../README.md).

---

## 1. What the system does

The system works in three stages:

1. It receives the values of six sensors over the network (OSC protocol, UDP port **8001**).
2. Each value selects one sentence from a list. The six sentences together form the description of the image (the *prompt*).
3. Stable Diffusion XL generates the image, which is cross-faded on the projector. While each image is being generated, the projector shows previews of it taking shape.

The subject is always a server room inside a rainforest. The sensors decide the conditions it appears in:

| Sensor (OSC address) | What it changes | Low value → high value | File |
| --- | --- | --- | --- |
| EMG 2 (`/synaptic/emg2`) | Vegetation | bare branches → healthy leaves → flowers → dry leaves → broken branches | `data/1.txt` |
| Soil (`/synaptic/soil`) | Land and water | desert → rivers → swamps | `data/2.txt` |
| Temperature (`/synaptic/temperature`) | Sky | storm → clear and sunny | `data/3.txt` |
| Humidity (`/synaptic/humidity`) | Atmosphere | sharp shadows → dense fog | `data/4.txt` |
| Light (`/synaptic/light`) | Time of day | dusk → noon | `data/5.txt` |
| EMG 1 (`/synaptic/emg1`) | Technology | server racks → datacenter with industrial batteries | `data/6.txt` |

Sensor values must arrive **already normalised between 0 and 1**.

**Sensor changes during a generation are ignored on purpose.** While an image is being generated, new sensor values do not pile up in a queue. When the image is ready, the next one is generated from the sensors' state *at that moment*. This way the projection always reflects the present, never a backlog from minutes earlier. On a slower PC the images simply change less often.

You can rewrite the sentences by opening the `.txt` files in Notepad. Put one sentence per line, ordered from low value to high value, and end each line with `, ` (comma and space).

---

## 2. What you need

**Hardware**
- [ ] Windows 10 or 11 PC with an **NVIDIA** graphics card. 8 GB of video memory (VRAM) or more is recommended. Less can work, but more slowly (see §5).
- [ ] At least 30 GB of free disk space for the WebUI, the models and the generated images
- [ ] Projector or second monitor
- [ ] Network connection to the sensor computer

**Software and files**
- [ ] **Max 8.6** or later ([cycling74.com](https://cycling74.com/downloads)). A licence is needed to run the patch with full functionality.
- [ ] **CNMAT odot package** for Max: it receives and routes the OSC sensor data. Install it from Max's Package Manager (see §3.3).
- [ ] **Stable Diffusion WebUI (AUTOMATIC1111)** ([github.com/AUTOMATIC1111/stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui)) and its requirements: Python 3.10.6 and Git
- [ ] **SDXL base model:** `sd_xl_base_1.0.safetensors` (from Hugging Face, `stabilityai/stable-diffusion-xl-base-1.0`)
- [ ] **The two custom LoRA files:** `Rainforest-000006.safetensors` and `Server_Room-000003.safetensors`. They were trained specifically for this work and are **the artist's property**. That is why they are not in the project repository. Ask the artist for them, and do not share or upload them anywhere.
- [ ] **This project folder** (`synaptic`)

---

## 3. Installation

### 3.1 Stable Diffusion WebUI

The WebUI is the free AUTOMATIC1111 software. Its official page, with installation notes, is [github.com/AUTOMATIC1111/stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui).

**Where to install it:** in its own folder, **separate from the `synaptic` project**, on the fastest drive (SSD), with a short path without spaces. Avoid `Program Files`, the Desktop and OneDrive-synced folders. The recommended location, used in the rest of this guide, is:

```
C:\sd\stable-diffusion-webui
```

1. Install [Python 3.10.6](https://www.python.org/downloads/release/python-3106/) (tick *Add Python to PATH*) and [Git for Windows](https://git-scm.com/download/win). Newer Python versions are not supported by the WebUI.
2. Open a Command Prompt and download the WebUI:

   ```bat
   mkdir C:\sd
   cd C:\sd
   git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
   ```
3. Copy `sd_xl_base_1.0.safetensors` into `stable-diffusion-webui\models\Stable-diffusion\`.
4. Copy the two LoRA files into `stable-diffusion-webui\models\Lora\`.
5. Open `webui-user.bat` in Notepad and set the launch options:

   ```bat
   set COMMANDLINE_ARGS=--api --port 7861
   ```

   - `--api` is **required**: without it, Max cannot communicate with Stable Diffusion.
   - `--port 7861` is **required**: the system expects this port.
   - For graphics cards with less than about 12 GB of VRAM, also add `--medvram-sdxl` (see §5).

6. Double-click `webui-user.bat`. The first launch downloads several GB and can take a long time. It is ready when the window shows:

   ```
   Running on local URL:  http://127.0.0.1:7861
   ```

7. Open `http://127.0.0.1:7861` in a browser. Generate one image with the SDXL model to check that everything works.

### 3.2 Launcher (`avvio.bat`)

`avvio.bat` in the project folder starts the WebUI. It still contains the folder path of the original PC. Open it in Notepad and change the `cd` line to your own WebUI folder:

```bat
@ECHO OFF
cd C:\sd\stable-diffusion-webui\
call webui-user.bat
```

### 3.3 Max and the project

1. Install Max.
2. Copy the `synaptic` project folder onto the PC, for example to the Desktop.
3. Check that the model name matches. Open `code\sd_comm_img_3_chat.js` in Notepad and look at line 39:

   ```js
   sd_model_checkpoint: "sd_xl_base_1.0.safetensors [31e35c80fc]",
   ```

   If your copy of the model shows a different name or code, use the name the WebUI shows. You can find it in the model dropdown at the top left of the WebUI page, or at `http://127.0.0.1:7861/docs` → *GET /sdapi/v1/sd-models* → *Try it out*.

4. **odot package:** in Max, open *File → Show Package Manager*, search for **odot** (by CNMAT) and install it. Without it, the OSC monitor box in the patch appears greyed out, and on some setups the sensor data is not routed at all. A fix is tracked in [issue #2](https://github.com/AhUhmm/synaptic/issues/2).
5. **Windows Firewall:** the first time Max opens, allow it on private networks. Otherwise OSC data from the sensors will not arrive.

---

## 4. Starting the installation

Follow this order every day:

1. **Start Stable Diffusion:** double-click `avvio.bat`. Wait for `Running on local URL: http://127.0.0.1:7861`.
2. **Open the project:** double-click `synaptic.maxproj`. The connection script starts on its own.
3. **Check the status lights** in the patch:

   | Light | Green means | If it is red |
   | --- | --- | --- |
   | Script Startup | The connection script is running | See §7 |
   | Setup Status | The model is loaded and the first image was generated | Stable Diffusion is not running, or `--api` / port 7861 are missing |
   | Inference Status | The last image was generated correctly | See §7 |

   The first image is a **test image of a puppy (a Maltese)**. That is intentional. An image clearly unrelated to the work is visual proof that the whole chain, from Max to Stable Diffusion and back, is working. It can be shown on the projector.

4. **Projector:** turn on the projector or second monitor, then click **Fullscreen**. The output window moves to the second display and fills it.
5. **Sensors:** under *Data Input*, the six sliders should move with the sensor values. If they don't, see §7.
6. **Timed Prompt:** turn it on if you want the image to keep changing even when the sensors are steady. By default a new image is generated 90 seconds after the previous one.

To stop: close Max, then close the Stable Diffusion window.

**The `media` folder** keeps every generated image and preview. They may be reused for promotional purposes, so **do not empty it routinely**. Only if the disk is running out of space, copy its content to an external drive or archive first, then clear it.

---

## 5. Adapting to a less powerful graphics card

On a slower GPU each image takes longer, and with too little VRAM generation can fail. Here are the adjustments, from most to least effective.

### 5.1 Steps (main setting)

The number of *steps* is how many refinement passes Stable Diffusion makes on each image. Fewer steps means faster generation and slightly less detail. Generation time scales roughly in proportion to the step count.

The value is set **only** in `code\sd_comm_img_3_chat.js`, at **line 49**:

```js
  steps: 20,
```

Change the number with Notepad and save. Max reloads the script automatically, with no restart needed. Practical values:

| Steps | Effect |
| --- | --- |
| 20 | Original setting |
| 15 | About 25% faster, minimal visible difference |
| 12 | About 40% faster, slightly softer detail |
| below 10 | Noticeably worse with the standard SDXL model |

> The patch also contains a value named `steps` (50), inside Max. **Do not use it to change the inference speed:** it only controls how many previews are shown. See §6.

### 5.2 Image size

Each image gets one of three formats at random (lines 178–179 of the same file):

```js
    const widthValues = [1152, 768, 1366];
    const heightValues = [768, 1152, 768];
```

The third format (1366×768) is the heaviest. Smaller sizes are faster and use less memory, for example:

```js
    const widthValues = [1024, 680, 1152];
    const heightValues = [680, 1024, 648];
```

Keep the numbers **multiples of 8**. Avoid going much below 1024 on the long side, because SDXL loses quality at small sizes.

### 5.3 Memory options in `webui-user.bat`

| GPU memory (VRAM) | Add to `COMMANDLINE_ARGS` |
| --- | --- |
| 12 GB or more | nothing |
| 8–12 GB | `--medvram-sdxl` |
| less than 8 GB | `--lowvram` (works, but slowly) |

Example: `set COMMANDLINE_ARGS=--api --port 7861 --medvram-sdxl`

### 5.4 After any change

Always recalibrate the previews (§6). Otherwise they will appear at the wrong moments.

---

## 6. Recalibrating the previews

The system does not know how far along Stable Diffusion is. It shows previews at regular time intervals, worked out from how long one image takes to generate. When the computer, the steps or the image size change, that time changes too, and the previews have to be recalibrated:

1. Make sure Stable Diffusion is running and the patch is open.
2. Click **Run Test Prompt** and wait for the image to complete. The **Inference Time** box shows how long it took.
3. Click **Generate Preview Params**. The **Interval (sec)** and **No. Images** values update.
4. Generate a few more images and check that the previews arrive spread across the generation time.
5. Close Max normally so the settings are saved to `data\settings.json`. Reopen the project and check that the new values are still there.

With the original settings (27 s per image), the system showed 3 previews about 6 seconds apart.

---

## 7. Troubleshooting

| Problem | Likely cause | What to do |
| --- | --- | --- |
| *Script Startup* stays red | The connection script did not start | Open the Max Console (Window → Max Console) and the Node monitor in the patch. Check that the `code` folder is intact. |
| *Setup Status* red, or `not_ready_yet` | Stable Diffusion is not reachable | Check that the WebUI window is open and shows port **7861**, and that `webui-user.bat` contains `--api` |
| `setup_error` | Wrong model name | Fix line 39 of the script (§3.3) |
| `inference_error`, or "CUDA out of memory" in the WebUI window | Not enough video memory | Reduce steps and image size, and add `--medvram-sdxl` (§5) |
| Images are fine but don't look like a "server room in a rainforest" | LoRA files missing | Check that both LoRA files are in `models\Lora\`. The WebUI window shows a warning if it cannot find them. |
| Sliders under *Data Input* don't move | No sensor data arriving | Check that the sensor computer sends to this PC's IP on port **8001**, that the firewall allows Max, and that the addresses start with `/synaptic/` |
| Previews too early, too late or missing | Calibration out of date | Repeat §6 |
| The output window is on the wrong screen | Display order changed | Set the projector as the second display in Windows display settings, then click **Fullscreen** again |
| The OSC monitor box in the patch is greyed out | odot package not installed | Install odot (§3.3, step 4) |
| Disk almost full | `media` folder has grown | Archive the content of `media` elsewhere, then clear it (§4) |
