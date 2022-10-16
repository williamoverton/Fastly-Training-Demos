/// <reference types="@fastly/js-compute" />
import { Router } from "@fastly/expressly";
import * as jws from "jws";

import { createHomePage } from "./home.js";
import { createNewsPage } from "./news.js";
import { createLoginPage } from "./login.js";

const getJwtSecret = () => {
  return "supersecret";
}

const router = new Router();

router.get("/", async (req, res) => {
  const startTime = new Date().getTime();

  res.send(await createHomePage());
  res.headers.set("x-response-time", new Date().getTime() - startTime);
  res.headers.set("content-type", "text/html");
});

router.use("/news", async (req, res) => {

  // Check cookies for a user session
  const jwt = req.cookies.get("jwt");

  // If no session, redirect to login
  if (!jwt) {
    return res.redirect("/login");
  }

  let isValid = await jws.verify(jwt, "HS256", getJwtSecret());
  
  if(!isValid){
    console.log("Got invalid jwt!");
    res.redirect("/login");
    return;
  }

  // If the token is valid, set the session on the request
  try {
    req.session = JSON.parse((await jws.decode(jwt, "HS256", getJwtSecret())).payload);
  } catch (e) {
    console.log("Got invalid jwt!");
    res.redirect("/login");
    return;
  }
});

router.get("/news", async (req, res) => {
  const startTime = new Date().getTime();

  res.send(await createNewsPage());
  res.headers.set("x-response-time", new Date().getTime() - startTime);
  res.headers.set("content-type", "text/html");
});

router.get("/login", async (req, res) => {
  res.headers.set("content-type", "text/html");
  res.send(await createLoginPage());
});

router.post("/login", async (req, res) => {
  /**
   * Read post body for login credentials
   */
  const formData = await req.text();

  console.log(`Got form data: ${formData}`);

  // Parse the form data with URLSearchParams
  const tmpUrl = new URL(`http://localhost?${formData}`);
  const email = tmpUrl.searchParams.get("email");
  const _password = tmpUrl.searchParams.get("password"); // For this demo, we're not checking the password

  // If the username is not set correctly, return an error
  if(typeof email !== "string") {
    res.status = 400;
    return res.send("your must include a 'email' property in the login post body");
  }

  // Create JWT token
  const token = jws.sign({
    header: { alg: "HS256" },
    payload: {
      email: email,
    },
    secret: getJwtSecret(),
  });

  // Set the cookie
  res.cookie("jwt", token);

  // Redirect to home page now we are logged in
  return res.redirect("/");
});

router.listen();
