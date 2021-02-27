const { at } = require('core-js/fn/string');
const fs = require('fs');
const list = require('./list');
const strings = require('./strings');

const components = {};
const jsMain = fs.readFileSync('examples/main.js', {
  encoding:'utf8',
  flag:'r'
});
const componentMatches = jsMain
  .matchAll(/Vivere.register\(['"]([A-z]+)['"], ([A-z]+)\);/g);
for (let match of componentMatches) {
  const componentName = match[1];
  const importName = match[2];
  components[componentName] = importName;
}

const importMatches = jsMain
  .matchAll(/import ([A-z]+) from ['"]([A-z0-9-./@]+)["']/g);
for (let match of importMatches) {
  const importName = match[1];
  const filePath = `examples${match[2].slice(1)}`;

  for (let componentName in components) {
    const impName = components[componentName];
    if (impName === importName) {
      const jsFileContent = fs.readFileSync(filePath, {
        encoding:'utf8',
        flag:'r'
      });

      const exportedContent = jsFileContent
        .match(/export default {(.|\s)*/)[0];

      const attributes = [];
      const attributesMatcher = exportedContent
        .matchAll(/^\s{2}([A-z]+):/gm);
      for (let _match of attributesMatcher) {
        const attribute = _match[1];
        attributes.push(attribute);
      }

      components[componentName] = attributes;
    }
  }
}

module.exports = {
  parseDirectives(fileName) {
    const directives = [];

    // Read the file
    const fileContent = fs.readFileSync(fileName, {
      encoding:'utf8',
      flag:'r'
    });

    // Check for included partials
    const includeMatches = fileContent
      .matchAll(/<%- include\('([/A-z-]+)/g);
    for (let match of includeMatches) {
      const filePart = match[1];
      const includedDirectives = this.parseDirectives(`examples/includes${filePart}.ejs`);

      for (directive of includedDirectives)
        directives.push(directive);
    }

    // Parse HTML directives
    const directiveMatches = fileContent
      .matchAll(/\s(v-[A-z]+)/g);
    for (let match of directiveMatches) {
      const directive = match[1];
      directives.push(directive);
    }

    // Parse Javascript usage
    const componentMatches = fileContent
      .matchAll(/v-component=["']([A-z-]+)["']/g);
    for (let match of componentMatches) {
      const componentCode = match[1];
      const componentName = strings.pascalCase(componentCode);
      const componentAttributes = components[componentName];

      if (componentAttributes != null)
        for (let attribute of componentAttributes)
          directives.push(attribute);
    }

    return directives
      .filter(list.uniqueness)
      .sort();
  },
};
