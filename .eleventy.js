module.exports = function(eleventyConfig) {
  eleventyConfig.setUseGitIgnore(false);

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
