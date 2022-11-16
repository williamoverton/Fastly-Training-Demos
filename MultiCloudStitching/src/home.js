import Mustache from "mustache";
import { getHTMLTemplate, generateSidebar, generateHeader, time } from "./shared";

export const createHomePage = async (req) => {

  let startTime = new Date();

  const [products, template] = await Promise.all([
    time("Getting Products From GCP based API", getProducts([1, 2, 3, 4, 5, 6])),
    time("Getting html template from AWS S3 Bucket", getHTMLTemplate()),
  ]);

  let html = Mustache.render(template.result, {
    title: "Fastly Compute@Edge",
    header: generateHeader(req, "home"),
    content: formatProducts(products.result),
    footer: generateSidebar({
      startTime,
      items: [
        products.time,
        template.time,
      ]
    }),
  });

  return html;
};

const getProduct = async (id) => {
  const url = `https://sd-origin.global.ssl.fastly.net/product?id=${id}`;

  const response = await fetch(url, {
    backend: "product_origin",
    cacheOverride: new CacheOverride("override", { ttl: 120, surrogateKey: "demo" }),
  });

  const product = await response.json();

  return product;
}

const getProducts = async (productIds) => {
  const products = await Promise.all(productIds.map(getProduct));
  return products;
}

const formatProducts = (products) => {
  let html = `<h2>Content</h2><div class="row mb-2">`;

  products.forEach((product) => {
    html += `
      <div class="col-md-6">
        <div class="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative">
          <div class="col p-4 d-flex flex-column position-static">
            <strong class="d-inline-block mb-2 text-primary">New Product!</strong>
            <h3 class="mb-0">${product.name}</h3>
            <div class="mb-1 text-muted">$${product.price}</div>
            <p class="card-text mb-auto">${product.description}</p>
            <a href="#" class="stretched-link">View More</a>
          </div>
        </div>
      </div>
    `;
  })

  html += `</div>`;

  return html;
}