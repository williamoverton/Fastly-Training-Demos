import Mustache from "mustache";
import { getHTMLTemplate, generateFooter, generateHeader } from "./shared";

export const createNewsPage = async () => {

  let startTime = new Date();

  const [template] = await Promise.all([
    getHTMLTemplate(),
  ]);

  let html = Mustache.render(template, {
    title: "Fastly Compute@Edge",
    header: generateHeader("news"),
    content: "Hello!",
    footer: generateFooter(startTime),
  });

  return html;
};