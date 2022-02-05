const fileParser = require('./file-parser');

const exampleGroups = [
  {
    id: 'toggle-button',
    name: 'Toggle Buttons',
    description: 'Basic buttons that turn things on and off',
    examples: [
      {
        id: 'basic',
        name: 'Basic Toggle',
      },
      {
        id: 'colorful',
        name: 'Colorful Toggle',
      },
    ],
  },
  {
    id: 'inputs',
    name: 'Inputs',
    description: 'Handling and syncing data with inputs',
    examples: [
      {
        id: 'text',
        name: 'Syncing Text',
      },
      {
        id: 'select',
        name: 'Syncing Dropdown',
      },
    ],
  },
  {
    id: 'links',
    name: 'Link Magic',
    description: 'Magically on demand link behavior',
    examples: [
      {
        id: 'basic',
        name: 'Basic Link Toggle',
      },
    ],
  },
  {
    id: 'images',
    name: 'Images',
    description: 'Fun with interactive images!',
    examples: [
      {
        id: 'hover',
        name: 'Image Hovering',
      },
    ],
  },
  {
    id: 'tabs',
    name: 'Tabs',
    description: 'Use tabs to control what views are shown',
    examples: [
      {
        id: 'basic',
        name: 'Basic Tabs',
        width: 2,
        gray: true,
      },
      {
        id: 'accordion',
        name: 'Accordion',
        width: 2,
        gray: true,
      },
    ],
  },
  {
    id: 'counters',
    name: 'Counters',
    description: 'Basic counters built a few different ways',
    examples: [
      {
        id: 'basic',
        name: 'Basic Counter',
      },
      {
        id: 'fancy',
        name: 'Fancy Counter',
      },
    ],
  },
  {
    id: 'lists',
    name: 'Lists',
    description: 'Dynamic lists of items',
    examples: [
      {
        id: 'basic',
        name: 'Basic List',
        width: 1,
      },
      {
        id: 'shuffle',
        name: 'Shuffleable List',
        width: 1,
      },
      {
        id: 'filter',
        name: 'Fitlerable List',
        width: 1,
      },
      {
        id: 'shuffle-filter',
        name: 'Shuffleable, Fitlerable List',
        width: 1,
      },
    ],
  },
  {
    id: 'to-do-list',
    name: 'To-Do List',
    description: 'An interactive to-do',
    examples: [
      {
        id: 'list',
        name: 'To-Do List',
        width: 2,
      },
    ],
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Push Vivere to its limits',
    examples: [
      {
        id: 'basic',
        name: 'List Performance',
        width: 1,
      },
      {
        id: 'ifs',
        name: 'If Performance',
        width: 1,
      },
    ],
  },
  {
    id: 'complex',
    name: 'Complex Interactions',
    description: 'Some advanced use cases for Viere',
    examples: [
      {
        id: 'toggle-list',
        name: 'Toggle List',
        width: 1,
      },
      {
        id: 'form',
        name: 'Form Submission',
        width: 1,
      },
    ],
  },
];

exampleGroups.forEach(eg => {
  eg.examples.forEach(e => {
    const { directives, scripts, partials, properties } = fileParser.parseDirectives(`examples/includes/examples/${eg.id}/${e.id}.ejs`);
    e.tags = directives.concat(properties);
    e.scripts = scripts;
    e.partials = partials;
    e.group = eg.id;
  });
});

module.exports = exampleGroups;
