/* 
 * Get product from API
 */
export const getProducts = async () => {

  let startTime = new Date().getTime();

  const url = `https://sd-origin.global.ssl.fastly.net/product/range?from=0&to=4`;

  const response = await fetch(url, {
    backend: "product_origin",
    cacheOverride: new CacheOverride("override", { ttl: 120, surrogateKey: "products" }),
  });

  const products = await response.json();

  let endTime = new Date().getTime();
  let timeDiff = endTime - startTime;
  console.log(`getProducts took ${timeDiff}ms`);

  return products;
}