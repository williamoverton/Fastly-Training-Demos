import Mustache from "mustache";
import { getHTMLTemplate, generateFooter, generateHeader } from "./shared";

import newsData from "./news_data.json";

export const createNewsPage = async (req) => {

  let startTime = new Date();

  const [template] = await Promise.all([
    getHTMLTemplate(),
  ]);

  let html = Mustache.render(template, {
    title: "Fastly Compute@Edge",
    header: generateHeader(req, "news"),
    content: generateNewsPage(req, newsData),
    footer: generateFooter(startTime),
  });

  return html;
};

const generateNewsItems = (req, newsData) => {
  let newsItems = "";

  const isLoggedIn = "session" in req;

  newsData.forEach((newsItem) => {

    if(newsItem.paid && !isLoggedIn) {
      newsItems += Mustache.render(blockedArticleTemplate, newsItem);
    } else {
      newsItems += Mustache.render(articleTemplate, newsItem);
    }

    
  });

  return newsItems;
}

const generateNewsPage = (req, newsData) => {
  return `
    <h1 class="text-center">Catchup on the latest posts</h1>
    <br />
    <div class="row justify-content-md-center">
      <div class="col col-lg-7">
        ${generateNewsItems(req, newsData)}
      </div>
    </div>
    <style>
      .blurred-image {
        filter    : blur(7px) brightness(70%);
        transform : scale(1.1);
      }
      .blocked-lock {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        color: #fff;
        padding: 6rem;
      }
      .blocked-lock > svg {
        width: 100%;
        height: 100%;
      }
    </style>
  `;
}

const articleTemplate = `
<div class="row mt-3">
  <div class="container">
    <div class="card w-100" style="width: 18rem;">
      <img src="https://sd-assets.global.ssl.fastly.net/640/300/tech?_={{id}}" class="card-img-top" alt="Header Image">
      <div class="card-body">
        <h5 class="card-title">{{title}}</h5>
        <p class="card-text">{{description}}</p>
        <a href="#" class="btn btn-primary">View</a>
      </div>
    </div>
  </div>
</div>
`

const blockedArticleTemplate = `
<div class="row mt-3">
  <div class="container">
    <div class="card w-100" style="width: 18rem; overflow: hidden;">
      <div class="card-header" style="overflow: hidden; position: relative">
        <img src="https://sd-assets.global.ssl.fastly.net/640/300/tech?_={{id}}" class="card-img-top blurred-image" alt="Header Image">
        <div class="blocked-lock">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 50 50" width="50px" height="50px">
            <g id="surface60904208">
              <path style=" stroke:none;fill-rule:nonzero;fill:rgb(100%,100%,100%);fill-opacity:1;" d="M 25 3 C 18.363281 3 13 8.363281 13 15 L 13 20 L 9 20 C 7.300781 20 6 21.300781 6 23 L 6 47 C 6 48.699219 7.300781 50 9 50 L 41 50 C 42.699219 50 44 48.699219 44 47 L 44 23 C 44 21.300781 42.699219 20 41 20 L 37 20 L 37 15 C 37 8.363281 31.636719 3 25 3 Z M 25 5 C 30.566406 5 35 9.433594 35 15 L 35 20 L 15 20 L 15 15 C 15 9.433594 19.433594 5 25 5 Z M 25 30 C 26.699219 30 28 31.300781 28 33 C 28 33.898438 27.601562 34.6875 27 35.1875 L 27 38 C 27 39.101562 26.101562 40 25 40 C 23.898438 40 23 39.101562 23 38 L 23 35.1875 C 22.398438 34.6875 22 33.898438 22 33 C 22 31.300781 23.300781 30 25 30 Z M 25 30 "/>
            </g>
          </svg>
          <h4 class="text-center mt-2">Unlock this post by logging in</h4>
        </div>
      </div>
      <div class="card-body">
        <h5 class="card-title">PREMIUM: {{title}}</h5>
        <p class="card-text">{{description}}</p>
        <a href="/login" class="btn btn-success">Login To View</a>
      </div>
    </div>
  </div>
</div>
`