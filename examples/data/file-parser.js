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
    const partials = [];
    const properties = [];

    // Read the file
    const fileContent = fs.readFileSync(fileName, {
      encoding:'utf8',
      flag:'r'
    });

    // Check for included partials
    const includeMatches = fileContent
      .matchAll(/<%- include\('([\/A-z-]+)/g);
    for (let match of includeMatches) {
      const filePart = match[1];
      const parsed = this.parseDirectives(`examples/includes${filePart}.ejs`);

      for (let partial of parsed.partials)
        partials.push(partial);

      for (let script of parsed.scripts)
        scripts.push(script);

      for (let directive of parsed.directives)
        directives.push(directive);

      for (let property of parsed.properties)
        properties.push(property);

      partials.push(`${filePart}.ejs`);
    }

    // Parse HTML directives
    const directiveMatches = fileContent
      .matchAll(/\s(v-[A-z]+)/g);
    for (let match of directiveMatches) {
      const directive = match[1];
      directives.push(directive);
    }

    // Parse directive shotcuts
    if (fileContent.match(/\s\#[A-z-]+/))
      directives.push('v-data');

    if (fileContent.match(/\s\$[A-z-]+/))
      directives.push('v-func');

    if (fileContent.match(/\s\*sync/))
      directives.push('v-sync');

    if (fileContent.match(/\s:[A-z-]+/))
      directives.push('v-attr');

    if (fileContent.match(/\s@[A-z-]+/))
      directives.push('v-on');

    if (fileContent.match(/\s\*if/))
      directives.push('v-if');

    if (fileContent.match(/\s\*else-if/))
      directives.push('v-else-if');

    if (fileContent.match(/\s\*else/))
      directives.push('v-else');

    const syncMatches = fileContent
      .matchAll(/\s\*sync+/g);
    if (syncMatches?.length)
      directives.push('v-sync');

    // Parse Javascript usage
    [/v-component=["']([A-z-]+)["']/g, /\*component=["']([A-z-]+)["']/g, /\*([A-z-]+)\*/g].forEach((regex) => {
      const componentMatches = fileContent.matchAll(regex);

      for (let match of componentMatches) {
        const componentCode = match[1];
        const componentName = strings.pascalCase(componentCode);
        const componentDetails = components[componentName];

        console.log(componentName);

        if (componentDetails != null) {
          const filePath = componentDetails.filePath;
          scripts.push(filePath);

          for (let attribute of componentDetails.attributes)
            directives.push(attribute);

          const scriptContent = fs.readFileSync(filePath, {
            encoding:'utf8',
            flag:'r'
          });

          if (scriptContent.match(/(\s|^)\$stored {/))
            properties.push('stored');

          if (scriptContent.match(/(\s|^)\$passed {/))
            properties.push('passed');

          if (scriptContent.match(/(\s|^)get [A-z]+\(\) {/))
            properties.push('computed');

          if (scriptContent.match(/(\s|^)on[A-z]+Changed\(/))
            properties.push('watch');

          if (scriptContent.match(/(\s|^)beforeConnected\(\) {/))
            properties.push('beforeConnected');

          if (scriptContent.match(/(\s|^)connected\(\) {/))
            properties.push('connected');

          if (scriptContent.match(/(\s|^)beforeDestroyed\(\) {/))
            properties.push('beforeDestroyed');

          if (scriptContent.match(/(\s|^)destroyed\(\) {/))
            properties.push('destroyed');

          if (scriptContent.match(/(\s|^)beforeDehydrated\(\) {/))
            properties.push('beforeDehydrated');

          if (scriptContent.match(/(\s|^)dehydrated\(\) {/))
            properties.push('dehydrated');

          if (scriptContent.match(/\$attach\(/))
            properties.push('$attach');

          if (scriptContent.match(/\$refs/))
            properties.push('$refs');

          if (scriptContent.match(/\$dispatch\(/))
            properties.push('$dispatch');
        }
      }
    });

    return {
      directives: directives
        .filter(list.uniqueness)
        .filter(d => d !== 'v-component')
        .sort(list.directives),
      scripts: scripts
        .filter(uniqueness)
        .sort(),
      partials: partials
        .filter(list.uniqueness)
        .sort(),
      properties: properties
        .filter(list.uniqueness)
        .sort(),
    };
  },
};
