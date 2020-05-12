import Attributes from '../lib/attributes.js';
import Directives from './directives.js';

export class Component {
  constructor(element, definition) {
    Object.assign(this, {
      ...definition,
      ...JSON.parse(JSON.stringify(definition.properties)),
      $element: element,
    });

    this.connectListeners();
    this.render();
    this.connected?.();
  }

  connectListeners() {
    Directives.Event.forEach((directive, event) => {
      Directives.queryElement(this.$element, directive, (el, value) => {
        el.addEventListener(event, (e) => {
          this[value]?.();
          this.render();
        });
      });
    });
  }

  render() {
    Directives.Display.forEach((directive) => {
      Directives.queryElement(this.$element, directive, (el, value) => {
        switch (directive) {
          case 'v-if':
            const method = this[value] ? 'remove' : 'add';
            el.classList[method]('hidden');
            break;
          case 'v-text':
            const text = this[value]?.();
            el.textContent = text;
            break;
        };
      });
    });
  }
};

Component.setup = (element, vivere) => {
  const name = Attributes.normalized(element, 'v-component');
  const definition = vivere.components[name];

  const instance = new Component(element, definition);
  element.$component = instance;
};
