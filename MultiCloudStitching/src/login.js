import Mustache from "mustache";
import { getHTMLTemplate, generateFooter, generateHeader } from "./shared";

const formHTML = `
<div class="container text-center">
  <div class="row">
    <div class="col-md-6 offset-md-3">

      <h2>You must login to view the news</h2>
      <p class="font-italic">Any email and password will work in this demo</p>
      <br/>

      <form method="POST">
        <!-- Email input -->
        <div class="form-outline mb-4">
          <input type="email" id="email" name="email" class="form-control" value="user@example.com" />
          <label class="form-label" for="email">Email address</label>
        </div>

        <!-- Password input -->
        <div class="form-outline mb-4">
          <input type="password" id="password" name="password" class="form-control" />
          <label class="form-label" for="password">Password</label>
        </div>

        <!-- 2 column grid layout for inline styling -->
        <div class="row mb-4">
          <div class="col d-flex justify-content-center">
            <!-- Checkbox -->
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="" id="form2Example31" checked />
              <label class="form-check-label" for="form2Example31"> Remember me </label>
            </div>
          </div>

          <div class="col">
            <!-- Simple link -->
            <a href="#!">Forgot password?</a>
          </div>
        </div>

        <!-- Submit button -->
        <button type="submit" class="btn btn-primary btn-block mb-4">Sign in</button>
      </form>
    </div>
  </div>
</div>
`

export const createLoginPage = async (req) => {

  let startTime = new Date();

  const [template] = await Promise.all([
    getHTMLTemplate(),
  ]);

  let html = Mustache.render(template, {
    title: "Fastly Compute@Edge",
    header: generateHeader(req, "login"),
    content: formHTML,
    footer: generateFooter(startTime),
  });

  return html;
}