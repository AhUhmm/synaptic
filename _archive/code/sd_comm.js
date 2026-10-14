const maxApi = require("max-api");
const http = require("http");

const urlparams = {
  hostname: "127.0.0.1",
  port: 7860,
  path: "/sdapi/v1/txt2img",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

let payload = {
  prompt: "little orcs",
  steps: 50,
};

const updateParams = {
  hostname: "127.0.0.1",
  port: 7860,
  path: "/sdapi/v1/progress?skip_current_image=false",
  method: "GET",
};

maxApi.outlet("Partiti!");

function SendRequest(datatosend) {
  function OnResponse(response) {
    var rawData = "";

    response.on("data", function (chunk) {
      rawData += chunk; //Append each chunk of data received to this variable.
    });
    response.on("end", function () {
      const parsedData = JSON.parse(rawData);
      //maxApi.post(parsedData); //Display the server's response, if any.
      //maxApi.setDict("imgResp", parsedData);
      maxApi.outlet(parsedData);
      maxApi.outletBang();
    });
  }

  var request = http.request(urlparams, OnResponse); //Create a request object.

  request.write(datatosend); //Send off the request.
  request.end(); //End the request.
}

maxApi.addHandler("test", () => {
  SendRequest(JSON.stringify(payload));
});

maxApi.addHandler("check", () => {
  const req = http
    .request(updateParams, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      // Ending the response
      res.on("end", () => {
        let pd = JSON.parse(data);
        maxApi.outlet(pd.current_image);
      });
    })
    .on("error", (err) => {
      console.log("Error: ", err);
    })
    .end();
});
