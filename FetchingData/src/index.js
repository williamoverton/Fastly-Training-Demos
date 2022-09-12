/// <reference types="@fastly/js-compute" />

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

// Example deployed at: https://precisely-whole-rat.edgecompute.app/

async function handleRequest(event) {
  
  /**
   * Since fetch() returns a Promise<Response>, you can return it directly
   */
  // return fetch("https://some-random-api.ml/facts/cat", {
  //   backend: "main_origin",
  // });


  
  /**
   * Or you can await it and use the Response object to read the body
   */
  const dataReq = await fetch("https://some-random-api.ml/facts/cat", {
    backend: "main_origin",
    cacheOverride: new CacheOverride("override", { ttl: 60 }), // Cache for 60 seconds
  });

  // Read the body as a JS object (this API returns JSON)
  const data = await dataReq.json();

  let message = `Your cat fact is: ${data.fact}`

  // Return a new Response with the body set to the fact
  return new Response(message);
}
