/// <reference types="@fastly/js-compute" />
const Mustache = require("mustache");

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

const getFact = async () => {
  const url = "https://dzlhynv1v2wzy.cloudfront.net/facts.json";

  const response = await fetch(url, {
    backend: "aws_origin",
  });

  const facts = await response.json();

  return facts[parseInt(Math.random() * facts.length)];
};

const getHTMLTemplate = async () => {
  const url = "https://dzlhynv1v2wzy.cloudfront.net/template.html";

  const response = await fetch(url, {
    backend: "aws_origin",
  });

  const template = await response.text();

  return template;
};

const createBody = async () => {
  
  const [fact, template] = await Promise.all([
    getFact(),
    getHTMLTemplate(),
  ]);

  let html = Mustache.render(template, {
    title: "Fastly Compute@Edge",
    body: fact,
  });

  return html;
};

async function handleRequest(event) {
  return new Response(await createBody(), {
    headers: {
      "content-type": "text/html",
    },
    status: 200,
  });
}
