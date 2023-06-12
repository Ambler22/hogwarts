import http from "node:http";

export { parseFormData, redirect, json };

/**
 * @param {http.IncomingMessage} request
 * @returns {Promise<FormData>}
 */
async function parseFormData(request) {
  return new Promise(function (resolve, reject) {
    var chunks = [];

    request.on("data", function (chunk) {
      chunks.push(chunk);
    });

    request.on("end", function () {
      var body = Buffer.concat(chunks).toString();
      var params = new URLSearchParams(body);
      var formData = new FormData();

      for (let [key, value] of params) {
        formData.append(key, value);
      }

      resolve(formData);
    });

    request.on("error", reject);
  });
}

/**
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {string} path
 * @param {number} statusCode
 */
function redirect(request, response, path, statusCode = 302) {
  response
    .writeHead(statusCode, {
      Location: `http://${request.headers.host}${path}`,
    })
    .end();
}

/**
 * @param {http.ServerResponse} response
 * @param {any} data
 * * @param {number} statusCode
 */
function json(response, data, statusCode = 200) {
  response
    .writeHead(statusCode, { "Content-Type": "application/json" })
    .end(JSON.stringify(data));
}
