module.exports = function(eleventyConfig) {
  eleventyConfig.setUseGitIgnore(false);

  eleventyConfig.setBrowserSyncConfig({
    // scripts in body conflict with Turbolinks
    snippetOptions: {
      rule: {
        match: /<\/head>/i,
        fn: function(snippet, match) {
          return snippet + match;
        }
      }
    }
  });

  eleventyConfig.addWatchTarget("tmp/main.css");
  eleventyConfig.addWatchTarget("tmp/main.js");
  eleventyConfig.addPassthroughCopy({ "tmp": "." });

  return {
    dir: {
      input: "examples",
      includes: "includes",
      layouts: "layouts",
      output: "_examples",
      data: "data",
    },
    markdownTemplateEngine: 'ejs',
  };
};
