// Include necessary node.js components
const maxApi = require("max-api");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ExifImage = require("exif").ExifImage;

// Parameters for HTTP request headers
const promptParams = {
  hostname: "127.0.0.1",
  port: 7861,
  path: "/sdapi/v1/txt2img",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

const setupParams = {
  hostname: "127.0.0.1",
  port: 7861,
  path: "/sdapi/v1/options",
  method: "POST",
};

const updateParams = {
  hostname: "127.0.0.1",
  port: 7861,
  path: "/sdapi/v1/progress?skip_current_image=false",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

// per individuare il nome esatto del modello fare il test dalla documentazione dell'api
// l'endpoint è http://127.0.0.1:7861/docs#/default/get_sd_models_sdapi_v1_sd_models_get
// vedi https://github.com/AUTOMATIC1111/stable-diffusion-webui/discussions/5206 per maggiori info
const setupPayload = {
  sd_model_checkpoint: "sd_xl_base_1.0.safetensors [31e35c80fc]",
  show_progress_every_n_steps: 2,
};

let payload = {
  batch_size: 1,
  prompt: "maltese puppy",
  negative_prompt:
    "mesh design,  worst quality, normal quality, low quality, low res, blurry, text, watermark, logo, banner, extra digits, cropped, jpeg artifacts, signature, username, error, sketch ,duplicate, ugly, monochrome, horror, geometry, mutation, disgusting",
  cfg_scale: 13,
  steps: 20,
  width: 768,
  height: 1152,
};

const newPrompt = "newPrompt";

function SendPrompt(datatosend) {
  function OnResponse(response) {
    let rawData = "";

    response.on("data", function (chunk) {
      rawData += chunk; // Append each chunk of data received to this variable.
    });

    response.on("end", function () {
      try {
        const parsedData = JSON.parse(rawData); // Convert to JSON
        const imgBase = parsedData.images.toString(); // Extract image value and convert to string
        const imgBuffer = Buffer.from(imgBase, "base64"); // Convert string to image using Buffer function

        const imgName = `${Date.now().toString()}.png`; // Assign a name to the image
        fs.writeFileSync(path.join("../media", imgName), imgBuffer); // Save the image

        const filepath = path.resolve("../media", imgName); // Get the absolute path of the image

        maxApi.outlet(filepath); // Send the image path to the outlet
        maxApi.outletBang();
        //maxApi.post("prompt_completed");
      } catch (error) {
        maxApi.outlet("inference_error"); // Output "not_ready_yet" message through maxApi
        maxApi.post("inference error");
        console.error("Error:", error.message); // Log the error
      }
    });

    response.on("error", function (error) {
      maxApi.outlet("not_ready_yet"); // Output "not_ready_yet" message through maxApi
      console.error("Error:", error.message); // Log the error
    });
  }

  const request = http.request(promptParams, OnResponse); // Create a request object

  request.write(datatosend); // Send the request
  request.end(); // End the request
}

function setUpPrompt(datatosend) {
  function OnResponse(response) {
    let rawData = "";

    response.on("data", function (chunk) {
      rawData += chunk; // Append each chunk of data received to this variable.
    });

    response.on("end", function () {
      try {
        const parsedData = JSON.parse(rawData); // Convert to JSON
        const imgBase = parsedData.images.toString(); // Extract image value and convert to string
        const imgBuffer = Buffer.from(imgBase, "base64"); // Convert string to image using Buffer function

        const imgName = `${Date.now().toString()}.png`; // Assign a name to the image
        fs.writeFileSync(path.join("../media", imgName), imgBuffer); // Save the image

        const filepath = path.resolve("../media", imgName); // Get the absolute path of the image
        maxApi.outlet("all_set");
        maxApi.outlet(filepath); // Send the image path to the outlet
        //maxApi.post("prompt_completed");
      } catch (error) {
        maxApi.outlet("setup_error"); // Output "not_ready_yet" message through maxApi
        maxApi.post("inference error");
        console.error("Error:", error.message); // Log the error
      }
    });

    response.on("error", function (error) {
      maxApi.outlet("not_ready_yet"); // Output "not_ready_yet" message through maxApi
      console.error("Error:", error.message); // Log the error
    });
  }

  const request = http.request(promptParams, OnResponse); // Create a request object

  request.write(datatosend); // Send the request
  request.end(); // End the request
}

function updateRequest() {
  function OnResponse(response) {
    let body = "";

    response.on("data", function (chunk) {
      body += chunk; // Append each chunk of data received to this variable.
    });

    response.on("end", function () {
      try {
        //maxApi.post(body);
        const parsedData = JSON.parse(body); // Convert to JSON
        const imgBase = parsedData.current_image.toString(); // Extract image value and convert to string
        const imgBuffer = Buffer.from(imgBase, "base64"); // Convert string to image using Buffer function

        const imgName = `${Date.now().toString()}.png`; // Assign a name to the image
        fs.writeFileSync(path.join("../media", imgName), imgBuffer); // Save the image

        const filepath = path.resolve("../media", imgName); // Get the absolute path of the image
        maxApi.outlet(filepath); // Send the image path to the outlet
      } catch (error) {
        maxApi.outlet("not_ready_yet"); // Output "not_ready_yet" message through maxApi
        console.error("Error:", error.message); // Log the error
      }
    });

    response.on("error", function (error) {
      maxApi.outlet("not_ready_yet"); // Output "not_ready_yet" message through maxApi
      console.error("Error:", error.message); // Log the error
    });
  }

  const request = http.get(updateParams, OnResponse); // Create a request object
}

maxApi.addHandlers({
  postPrompt: async () => {
    const updatedDict = await maxApi.getDict(newPrompt); // Get dict in max
    payload.prompt = updatedDict.prompt; // Update the payload with new values from dict

    // Define arrays for width and height values
    const widthValues = [1152, 768, 1366];
    const heightValues = [768, 1152, 768];

    // Pick a random index between 0 and 2
    const randomIndex = Math.floor(Math.random() * 3);

    // Update payload with corresponding width and height values
    payload.width = widthValues[randomIndex];
    payload.height = heightValues[randomIndex];

    SendPrompt(JSON.stringify(payload)); // Send request with new prompt
  },

  setUp: async () => {
    const request = http.request(setupParams); // Create request object
    request.write(JSON.stringify(setupPayload)); // Send the request
    request.end(); // End the request
    setUpPrompt(JSON.stringify(payload)); // Send first prompt with default parameters
  },

  showProgress: async () => {
    updateRequest();
  },
});
