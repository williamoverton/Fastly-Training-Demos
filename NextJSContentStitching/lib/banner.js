
export const getBannerContent = async () => {
  let startTime = new Date().getTime();

  const f = await fetch("https://sd-origin.global.ssl.fastly.net/product/quote.html", {
    backend: "product_origin",
    cacheOverride: new CacheOverride("override", { ttl: 120, surrogateKey: "banner" }),
  });

  const content = await f.text();

  let endTime = new Date().getTime();
  let timeDiff = endTime - startTime;
  console.log(`getBannerContent took ${timeDiff}ms`);
  
  return content
}