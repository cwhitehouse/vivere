const { at } = require('core-js/fn/string');
const fs = require('fs');
const { uniqueness } = require('./list');
const list = require('./list');
const strings = require('./strings');

const components = {};
const jsMain = fs.readFileSync('examples/main.ts', {
  encoding:'utf8',
  flag:'r'
});
const componentMatches = jsMain
  .matchAll(/Vivere.register\(['"]([A-z]+)['"], ([A-z]+)\);/g);
for (let match of componentMatches) {
  const componentName = match[1];
  const importName = match[2];
  components[componentName] = {
    importName,
  };
}

const importMatches = jsMain
  .matchAll(/import ([A-z]+) from ['"]([A-z0-9-./@]+)["']/g);
for (let match of importMatches) {
  const importName = match[1];
  let filePath = `examples${match[2].slice(1)}`;

  for (ext of ['.js', '.ts']) {
    const path = filePath + ext;
    if (fs.existsSync(path)) {
      filePath = path;
      break;
    }
  }

  for (let componentName in components) {
    const impName = components[componentName].importName;
    if (impName === importName) {
      const jsFileContent = fs.readFileSync(filePath, {
        encoding:'utf8',
        flag:'r'
      });

      const exportedContent = jsFileContent
        .match(/export [A-z ]* {(.|\s)*/)[0];

      const attributes = [];
      const attributesMatcher = exportedContent
        .matchAll(/^\s{2}([A-z]+):/gm);
      for (let _match of attributesMatcher) {
        const attribute = _match[1];
        attributes.push(attribute);
      }

      components[componentName].attributes = attributes;
      components[componentName].filePath = filePath;
    }
  }
}

module.exports = {
  parseDirectives(fileName) {
    const directives = [];
    const scripts = [];

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
      const parsed = this.parseDirectives(`examples/includes${filePart}.ejs`);

      for (script of parsed.scripts)
        scripts.push(script);

      for (directive of parsed.directives)
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
      const componentDetails = components[componentName];

      if (componentDetails != null) {
        scripts.push(componentDetails.filePath);

        for (let attribute of componentDetails.attributes)
          directives.push(attribute);
      }
    }

    return {
      directives: directives
        .filter(list.uniqueness)
        .filter(d => d !== 'v-component')
        .sort(list.directives),
      scripts: scripts
        .filter(uniqueness)
        .sort(),
    };
  },
};
