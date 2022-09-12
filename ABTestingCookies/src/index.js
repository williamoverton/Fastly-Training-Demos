/// <reference types="@fastly/js-compute" />

import { Router } from "@fastly/expressly";

const router = new Router();

// Visit http://127.0.0.1:7676/cookies to see cookies whilst running example locally

const tests = [
  {
    name: "A/B Test 1",
    cookieName: "ab-test-1",
    percentage: 50,
    activeValue: "A",
    inactiveValue: "B",
    cookieOpts: {
      path: "/",
    },
  },
  {
    name: "A/B Test 2",
    cookieName: "ab-test-2",
    percentage: 20,
    activeValue: "A",
    inactiveValue: "B",
    cookieOpts: {
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    },
  },
];

// On every request we make sure the user is a part of all tests
router.use((req, res) => {

  // Loop through all tests
  tests.map((test) => {

    // Only set cookie if it is not already set
    if (!req.cookies.has(test.cookieName)) {
      
      // Set cookie to active or inactive value based on percentage and random number
      let selectedValue = Math.random() < test.percentage / 100 ? test.activeValue : test.inactiveValue;

      // Set cookie for the upstream request
      req.cookies.set(test.cookieName, selectedValue);

      // Set cookie for the response
      res.cookie(test.cookieName, selectedValue, test.cookieOpts);
    }
  });
  
});

const originHostname = "httpbin.org";

router.all("*", async (req, res) => {
  let url = new URL(req.url);

  // Change the hostname of the url to our origin
  url.host = originHostname;

  // remove port, defaulting to 443 or 80 depending on protocol.
  url.port = "";

  // Change Host header to the correct one for our origin
  req.headers.set("Host", originHostname);

  // Make a request to the origin
  let originRequest = await fetch(url.toString(), {
    backend: "main_origin",
    headers: req.headers,
    method: req.method,
    body: (req.method == "POST" ? await req.text() : undefined),
  });

  // Send response
  res.send(originRequest);
});

router.listen();