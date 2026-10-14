// includi componenti necessarie di node.js
const maxApi = require("max-api");
const http = require("http");
const fs = require("fs");
const path = require("path");

// parametri necessari per la richiesta HTTP
const urlparams = {
  hostname: "127.0.0.1",
  port: 7860,
  path: "/sdapi/v1/txt2img",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

// il payload da trasmettere all'API
let payload = {
  prompt: "maltese puppy",
  steps: 5,
};
const dictId = "promptDict";

maxApi.addHandler("getPrompt", () => {
  const dict = maxApi.getDict(dictId);
  // dict contains the dict's contents

  let payload2 = dict;
  maxApi.post(`dizionario originale\n${maxApi.getDict("promptDict")}`);
  console.log(dict);
  console.log(payload2);
  maxApi.post("dinamico\n" + payload2.prompt);
  maxApi.post("statico\n" + payload.prompt);
  SendRequest(JSON.stringify(payload2));
});

//funzione per inviare il prompr a stable diffusion con una richiesta HTTP
//la funzione prende un parametro per il payload con il prompt da trasmettere
function SendRequest(datatosend) {
  function OnResponse(response) {
    var rawData = "";
    response.on("data", function (chunk) {
      rawData += chunk; //Append each chunk of data received to this variable.
    });
    response.on("end", function () {
      maxApi.post("trasmissione completata. \n Inizio decodifica.");
      var parsedData = JSON.parse(rawData); //converti in JSON il risultato
      var imgBase = parsedData.images.toString(); // estrai il valore dell'immagine e convertilo in stringa
      var imgBuffer = Buffer.from(imgBase, "base64"); // usa la funzione nativa Buffer per convertire la stringa in immagine

      var imgName = `${Date.now().toString()}.png`; //assegna un nome all'immagine
      fs.writeFileSync(path.join("../media", imgName), imgBuffer); //salva l'immagine

      var filepath = path.resolve("../media", imgName); // ottieni la path assoluta dell'immagine
      maxApi.post(filepath); //stampa la path nella console di max
      maxApi.outlet(filepath); // manda in outlet la path dell'immagine
    });
  }

  var request = http.request(urlparams, OnResponse); //Create a request object.

  request.write(datatosend); //Send off the request.
  request.end(); //End the request.
}

maxApi.addHandler("setUp", () => {
  SendRequest(JSON.stringify(payload));
  maxApi.post("richiesta inviata");
});
