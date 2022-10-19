
export default (req, res) => {
  /*
   * A/B Testing for header design
   */
  let headerAb = undefined;

  if(req.cookies.headerAB === "A") {
    headerAb = "A";
  } else if(req.cookies.headerAB === "B") {
    headerAb = "B";
  } else {
    const value = Math.random() > 0.5 ? "A" : "B";
    res.setHeader("Set-Cookie", `headerAB=${value}; path=/; max-age=86400`);
    headerAb = value;
  }

  return headerAb;
}