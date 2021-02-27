const fileParser = require('./file-parser');

const exampleGroups = [
  {
    id: 'toggle-button',
    name: 'Toggle Buttons',
    description: 'Basic buttons that turn things on and off ',
    examples: [
      {
        id: 'basic',
        name: 'Basic Toggle',
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
    ],
  },
  {
    id: 'accordion',
    name: 'Accordion',
    description: 'Fancy UI elements you might find in fancy apps!',
    examples: [
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
];

exampleGroups.forEach(eg => {
  eg.examples.forEach(e => {
    const directives = fileParser.parseDirectives(`examples/includes/examples/${eg.id}/${e.id}.ejs`);
    e.tags = directives;
  });
});

module.exports = exampleGroups;
