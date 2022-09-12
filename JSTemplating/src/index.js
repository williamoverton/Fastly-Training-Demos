/// <reference types="@fastly/js-compute" />
const Mustache = require('mustache');

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

const template = Buffer.from(fastly.includeBytes("./src/templates/index.mustache")).toString('utf8');

async function handleRequest(event) {

  const dataReq = await fetch("https://some-random-api.ml/facts/cat", {
    backend: "main_origin",
    cacheOverride: new CacheOverride("override", { ttl: 60 }), // Cache for 60 seconds
  });

  // Read the body as a JS object (this API returns JSON)
  const data = await dataReq.json();

  let message = `Your cat fact is: ${data.fact}`

  let html = Mustache.render(
    template,
    {
      fact: message,
    }
  );
  
  return new Response(html, { 
    status: 200,
    headers: {
      "content-type": "text/html",
    },
  });
}
