/* 
 * Get product from API
 */
export const getProduct = async (id) => {
  const url = `https://sd-origin.global.ssl.fastly.net/product?id=${id}`;

  const response = await fetch(url, {
    backend: "product_origin",
    cacheOverride: new CacheOverride("override", { ttl: 120, surrogateKey: "products" }),
  });

  const product = await response.json();

  return product;
}

/**
 * Get products by ID
 */
 export const getProducts = async (productIds) => {
  const products = await Promise.all(productIds.map(getProduct));
  return products;
}