/// <reference types="@fastly/js-compute" />

import { Router } from "@fastly/expressly";

const router = new Router();

router.get("/", async (req, res) => {
  return res.send("Hello world!");
});

router.get("/about", async (req, res) => {
  res.headers.set("content-type", "text/html");
  return res.send("<h1>This is an example of using Expressly.</h1>");
});

router.listen();