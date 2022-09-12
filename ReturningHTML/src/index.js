/// <reference types="@fastly/js-compute" />

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

async function handleRequest(event) {

  let body = `
    <html>
      <head>
        <title>Hello World!</title>
      </head>
      <body>
        <h1>Hello World!</h1>
        <p>This is a simple example of returning HTML from Fastly Compute@Edge.</p>
      </body>
    </html>
  `

  return new Response(body, { 
    status: 200,
    headers: {
      "content-type": "text/html",
    }
  });
}
