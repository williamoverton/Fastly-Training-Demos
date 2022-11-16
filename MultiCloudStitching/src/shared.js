export const getHTMLTemplate = async () => {
  const url = "https://dzlhynv1v2wzy.cloudfront.net/template.html";

  const response = await fetch(url, {
    backend: "aws_origin",
    cacheOverride: new CacheOverride("override", { ttl: 120, surrogateKey: "demo" })
  });

  const template = await response.text();

  return template;
};

export const generateHeader = (req, page) => {

  const isLoggedIn = "session" in req;

  return `
    <div class="container">
      <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
        <a href="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
          <span class="fs-4">Multi Cloud Stitching</span>
        </a>

        <ul class="nav nav-pills">
          <li class="nav-item"><a href="/" class="nav-link ${page == "home" ? "active" : ""}" aria-current="page">Home</a></li>
          <li class="nav-item"><a href="/news" class="nav-link ${page == "news" ? "active" : ""}">News Feed</a></li>
          ${!isLoggedIn ? `<li class="nav-item"><a href="/login" class="nav-link ${page == "login" ? "active" : ""}">Login</a></li>` : `<li class="nav-item"><a href="/logout" class="nav-link">Logout</a></li>`}
          <li class="nav-item"><button class="btn nav-link cache-clear">Clear Cache</button></li>
        </ul>
      </header>
    </div>
    <script>
      document.querySelector(".cache-clear").addEventListener("click", async (event) => {
        event.preventDefault();
        let element = targetElement = event.target || event.srcElement;
        element.innerHTML = "Clearing Cache...";
        await fetch("https://sd-origin.global.ssl.fastly.net/purge?key=demo", { method: "POST" });
        
        // wait 1 second to allow cache to clear
        await new Promise(resolve => setTimeout(resolve, 1000));

        window.location.reload();
      });
    </script>
  `;
}

export const generateSidebar = (timings) => {
  const time = (new Date()).getTime();

  const timingItems = timings.items.map((item) => {
    return `<li class="nav-item mb-2">${item.description}: <b>${item.time}ms</b></li>`;
  });

  return `
  <div class="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style="width: 280px; position: fixed; top: 0px; left: 0px; bottom: 100%; min-height: 100%">
    <a href="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
      <span class="fs-4">Debug Information</span>
    </a>
    <hr>
    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item">
        Page generated in: <b>${time - timings.startTime.getTime()}ms</b>
      </li>
      <hr/>
      ${timingItems.join("")}
    </ul>
  </div>

  `
}

export const time = async (description, promise) => {
  const startTime = new Date();
  const result = await promise;
  const endTime = new Date();
  return {
    result,
    time: {
      description,
      time: endTime.getTime() - startTime.getTime()
    }
  };
}