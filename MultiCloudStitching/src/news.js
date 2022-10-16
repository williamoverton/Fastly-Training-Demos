import Mustache from "mustache";
import { getHTMLTemplate, generateFooter, generateHeader } from "./shared";

import newsData from "./news_data.json";

export const createNewsPage = async () => {

  let startTime = new Date();

  const [template] = await Promise.all([
    getHTMLTemplate(),
  ]);

  let html = Mustache.render(template, {
    title: "Fastly Compute@Edge",
    header: generateHeader("news"),
    content: generateNewsPage(newsData),
    footer: generateFooter(startTime),
  });

  return html;
};

const generateNewsItems = (newsData) => {
  let newsItems = "";

  newsData.forEach((newsItem) => {
    newsItems += Mustache.render(articleTemplate, newsItem);
  });

  return newsItems;
}

const generateNewsPage = (newsData) => {
  return `
    <h1>News</h1>
    <div class="row justify-content-md-center">
      <div class="col col-lg-7">
        ${generateNewsItems(newsData)}
      </div>
    </div>
  `;
}

const articleTemplate = `
<div class="row mt-2">
  <div class="container">
    <div class="card w-100" style="width: 18rem;">
      <img src="http://placeimg.com/640/300/tech?_={{id}}" class="card-img-top" alt="Header Image">
      <div class="card-body">
        <h5 class="card-title">{{title}}</h5>
        <p class="card-text">{{description}}</p>
        <a href="#" class="btn btn-primary">Go somewhere</a>
      </div>
    </div>
  </div>
</div>
`