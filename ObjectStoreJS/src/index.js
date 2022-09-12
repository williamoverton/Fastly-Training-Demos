/// <reference types="@fastly/js-compute" />

// Example here: https://illegally-willing-bengal.edgecompute.app/

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

async function handleRequest(event) {
  const store = new ObjectStore('ExampleStore')

  await store.put('hello', 'world')

  const hello = await store.get('hello')
  console.log(`typeof: ${typeof hello}, value: ${hello}`)

  if(hello) {
    return new Response(await hello.text(), {
      headers: { "content-type": "text/plain" },
      status: 200,
    })
  } 
  
  // If we get here, the object was not found.
  return new Response("Not found", {
    headers: { "content-type": "text/plain" },
    status: 404,
  })
}

/**
 * Guide on creating a new ObjectStore using the API
 * 
 * Create a new ObjectStore
 * curl -i  -X POST "https://api.fastly.com/resources/stores/object" -H "Fastly-Key: $FASTLY_API_TOKEN" -H "Content-Type: application/json" -H "Accept: application/json" -d "{\"name\":\"example-store\"}"
 * 
 * Output: {"id":"mn5laa00heh0seqh1t7qko","name":"example-store","created_at":"2022-09-11T19:02:22.367Z","updated_at":"2022-09-11T19:02:22.367Z"}
 * 
 * 
 * Clone the service so we can modify it: $ fastly service-version clone --version latest
 * 
 * Link the store to your service
 * curl -i  -X POST "https://api.fastly.com/service/4tHj4SdSYcaqsadZXnh1Em/version/2/link" -H "Fastly-Key: $FASTLY_API_TOKEN" -H "Content-Type: application/x-www-form-urlencoded" -d "attachment_id=mn5laa00heh0seqh1t7qko&name=ExampleStore"
 * 
 * 
 * Activate the new version: $ fastly service-version activate --version latest
 */