/// <reference types="@fastly/js-compute" />

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

// Example here: https://correctly-excited-snipe.edgecompute.app/

async function handleRequest(event) {
  // Get the request path
  const url = new URL(event.request.url);
  const path = url.pathname;

  // Open redirects list
  const redirects = new Dictionary("redirects");

  // Check if the path is in the redirects list
  try {
    const next = redirects.get(path);
    
    // If it is, redirect to the next path
    if (next) {
      return new Response("Redirecting...", {
        status: 301,
        headers: {
          Location: next,
        },
      });
    }
  } catch(e){
    // There is no redirect for this path
  }

  // If there is no redirect, return the default response
  return new Response(`You are currently on ${path}`, { status: 200 });
}
