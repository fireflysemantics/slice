var ghpages = require("gh-pages");

ghpages.publish("doc",
  {
    dest: 'typedoc',
    repo: "git@github.com:fireflysemantics/slice.git"
  },
  function (err) {
    if (err) {
      console.error(err);
    }
  }
);