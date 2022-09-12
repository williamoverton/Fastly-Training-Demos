/// <reference types="@fastly/js-compute" />

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

// Deployed version here: https://geo-redirects-example.edgecompute.app/

const doRedirect = (event) => {

  // Get ISO 3166-1 country code 
  const country = event.client.geo.country_code3;

  // Default to redirecting to english site
  let redirectPath = "en-us";

  // Redirect to language specific site if available
  switch(country) {
    case "SWE": redirectPath = "sv-se"; break;
    case "NOR": redirectPath = "nb-no"; break;
    case "FIN": redirectPath = "fi-fi"; break;
    case "DEU": redirectPath = "de-de"; break;
  }

  // Return a redirect response
  return new Response("Redirecting...", { 
    status: 301,
    headers: {
      "Location": `/${redirectPath}/`,
    }
  });
}

// Only redirect if the request is for the root path
const shouldRedirect = (event) => {
  const url = new URL(event.request.url);
  const path = url.pathname;

  if(path === "/") {
    return true;
  }
}

// Handle the request
async function handleRequest(event) {
  // Handle redirects for language specific sites
  if(shouldRedirect(event)) {
    return doRedirect(event);
  }

  // Say hello!
  return new Response(`Hello ${event.client.geo.country_name}!`);
}