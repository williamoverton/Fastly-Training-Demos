
export const getBannerContent = async () => {
  const f = await fetch("https://sd-origin.global.ssl.fastly.net/product/quote.html", {
    backend: "product_origin",
    cacheOverride: new CacheOverride("override", { ttl: 120, surrogateKey: "banner" }),
  });

  const content = await f.text();
  return content
}