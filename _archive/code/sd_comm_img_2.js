// includi componenti necessarie di node.js
const maxApi = require("max-api");
const http = require("http");
const fs = require("fs");
const path = require("path");

// parametri necessari per gli header delle richieste HTTP
// parametri per richiesta invio prompt text2img
const promptParams = {
  hostname: "127.0.0.1",
  port: 7861,
  path: "/sdapi/v1/txt2img",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

//parametri per richiesta setup iniziale e opzioni
const setupParams = {
  hostname: "127.0.0.1",
  port: 7861,
  path: "/sdapi/v1/options",
  method: "POST",
};

// parametri per richiesta immagini intermedie
const updateParams = {
  hostname: "127.0.0.1",
  port: 7861,
  path: "/sdapi/v1/progress?skip_current_image=false",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

//payload per setup impostazioni
const setupPayload = {
  sd_model_checkpoint: "sd_xl_base_1.0.safetensors",
  show_progress_every_n_steps: 10,
};

// il payload da trasmettere all'API con i prompt
let payload = {
  batch_size: 1,
  prompt: "maltese puppy",
  steps: 20,
  width: 1024,
  height: 1024,
};

// dizionario MAX in cui si aggiornano i dati del prompt
const newPrompt = "newPrompt";

//funzione per inviare il prompt a stable diffusion con una richiesta HTTP
//la funzione prende un parametro per il payload con il prompt da trasmettere
function SendPrompt(datatosend) {
  function OnResponse(response) {
    var rawData = "";
    response.on("data", function (chunk) {
      rawData += chunk; //Append each chunk of data received to this variable.
    });
    response.on("end", function () {
      //maxApi.post("trasmissione completata. \n Inizio decodifica.");
      var parsedData = JSON.parse(rawData); //converti in JSON il risultato
      var imgBase = parsedData.images.toString(); // estrai il valore dell'immagine e convertilo in stringa
      var imgBuffer = Buffer.from(imgBase, "base64"); // usa la funzione nativa Buffer per convertire la stringa in immagine

      var imgName = `${Date.now().toString()}.png`; //assegna un nome all'immagine
      fs.writeFileSync(path.join("../media", imgName), imgBuffer); //salva l'immagine

      var filepath = path.resolve("../media", imgName); // ottieni la path assoluta dell'immagine
      //maxApi.post(filepath); //stampa la path nella console di max
      maxApi.outlet(filepath); // manda in outlet la path dell'immagine
    });
  }

  var request = http.request(promptParams, OnResponse); //Create a request object.

  request.write(datatosend); //Send off the request.
  request.end(); //End the request.
}

//la funzione per visualizzare le immagini intermedie
// di default vengono generate dal modello ogni 10 steps, per modificare questo intervallo bisogna modificare le opzioni nel setupPayload
function updateRequest() {
  function OnResponse(response) {
    //response.setEncoding("utf8");
    let body = "";

    response
      .on("data", function (chunk) {
        body += chunk; //Append each chunk of data received to this variable.
      })
      .on("end", function () {
        //maxApi.post("trasmissione completata. \n Inizio decodifica.");

        maxApi.post(body);
        var parsedData = JSON.parse(body); //converti in JSON il risultato
        var imgBase = parsedData.current_image.toString(); // estrai il valore dell'immagine e convertilo in stringa
        var imgBuffer = Buffer.from(imgBase, "base64"); // usa la funzione nativa Buffer per convertire la stringa in immagine

        var imgName = `${Date.now().toString()}.png`; //assegna un nome all'immagine
        fs.writeFileSync(path.join("../media", imgName), imgBuffer); //salva l'immagine

        var filepath = path.resolve("../media", imgName); // ottieni la path assoluta dell'immagine
        //maxApi.post(filepath); //stampa la path nella console di max
        maxApi.outlet(filepath); // manda in outlet la path dell'immagine
      });
  }

  http.get(updateParams, OnResponse); //Create a request object.
}

//handlers di max da richiamare nella patch con messagi all'oggetto node
maxApi.addHandlers({
  getPrompt: async () => {
    // update the prompt with the parameters from
    const updatedDict = await maxApi.getDict(newPrompt); //get dict in max
    payload.prompt = updatedDict.prompt; //update the payload with new values from dict
    SendPrompt(JSON.stringify(payload)); // Send request with new prompt
  },
  setUp: async () => {
    //send request to set up model options
    var request = http.request(setupParams); //Create request object.
    request.write(JSON.stringify(setupPayload)); //Send off the request.
    request.end(); //End the request.
    SendPrompt(JSON.stringify(payload)); //Send first prompt with default parameters.
  },
  showProgress: async () => {
    updateRequest();
  },
});
