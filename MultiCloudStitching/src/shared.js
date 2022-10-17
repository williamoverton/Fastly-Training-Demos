export const getHTMLTemplate = async () => {
  const url = "https://dzlhynv1v2wzy.cloudfront.net/template.html";

  const response = await fetch(url, {
    backend: "aws_origin",
    cacheOverride: new CacheOverride("override", { ttl: 120, surrogateKey: "assets" })
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
        await fetch("http://35.189.102.211/purge?key=products", { method: "POST" });
        
        // wait 1 second to allow cache to clear
        await new Promise(resolve => setTimeout(resolve, 1000));

        window.location.reload();
      });
    </script>
  `;
}

export const generateFooter = (startTime) => {
  const time = (new Date()).getTime();

  return `
  <div class="container">
    <footer class="py-3 my-4">
      <ul class="nav justify-content-center border-bottom pb-3 mb-3">
        <li class="nav-item"><a href="#" class="nav-link px-2 text-muted">Page generated in ${time - startTime.getTime()}ms</a></li>
      </ul>
      <p class="text-center text-muted">© 2022 Company, Inc</p>
    </footer>
  </div>
  `
}