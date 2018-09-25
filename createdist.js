const fs = require("fs");
const globby = require("globby");
const cpy = require("cpy"); 
require("mkdirp").sync("dist");
cpy("package.json", "dist");
cpy("README.md", "dist");
cpy("src/index.ts", "dist");
const options = { overwrite: true };
const rc = require("recursive-copy");
rc("target/src/", "dist", options).then(() => {
  globby("./dist/**/*.js")
    .then(paths => {
      paths.forEach(update);
    })
    .catch(e => console.log(e));

    globby("./dist/**/*.d.ts")
    .then(paths => {
      paths.forEach(update);
    })
    .catch(e => console.log(e));
});

function update(path) {
  count = (path.match(/\//g) || []).length;
  let replacement = "";
  if (count == 2) {
    replacement = "./";
  } else if (count > 2) {
    const size = count - 2;
    replacement = Array(size)
      .fill("../")
      .join("");
  } else {
    throw new Error("Invalid / count in path of file");
  }
  let js = fs.readFileSync(path, "utf8");
  js = js.replace(/@fs\//g, replacement);
  fs.writeFileSync(path, js);
}