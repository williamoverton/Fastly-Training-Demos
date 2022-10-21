/*
 * Copyright Fastly, Inc.
 * Licensed under the MIT license. See LICENSE file for details.
 */

/// <reference types="@fastly/js-compute" />

import createServer from "@fastly/next-compute-js";

import { assets } from './statics';

const server = await createServer({
  dir: '../../',
  computeJs: {
    assets,
    backends: {
      'httpbin': { url: 'https://httpbin.org/anything/' },
    },
  }
});

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));
async function handleRequest(event) {
  let startTime = new Date().getTime();
  try {
    const response = await server.handleFetchEvent(event);

    let endTime = new Date().getTime();
    let timeDiff = endTime - startTime;
    console.log(`handleRequest took ${timeDiff}ms`);

    return response
  } catch (error) {
    console.error(JSON.stringify(error))
    console.error(typeof error);
    return new Response("An Error Occurred", {status:500});
  }
}
