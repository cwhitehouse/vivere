import { ComponentDirective } from '../directives/component/component.js';
import { BindDirective } from '../directives/component/bind.js';
import { DataDirective } from '../directives/component/data.js';
import { PassDirective } from '../directives/component/pass.js';
import { ClassDirective } from '../directives/display/class.js';
import { DisabledDirective } from '../directives/display/disabled.js';
import { IfDirective } from '../directives/display/if.js';
import { SyncDirective } from '../directives/display/sync.js';
import { TextDirective } from '../directives/display/text.js';
import { ClickDirective } from '../directives/event/click.js';
import { MouseenterDirective } from '../directives/event/mouseenter.js';
import { MouseleaveDirective } from '../directives/event/mouseleave.js';
import { MouseoverDirective } from '../directives/event/mouseover.js';
import { RefDirective } from '../directives/ref.js';

export default {
  directives: [
    ComponentDirective,
    BindDirective,
    DataDirective,
    PassDirective,
    ClassDirective,
    DisabledDirective,
    IfDirective,
    SyncDirective,
    TextDirective,
    ClickDirective,
    MouseenterDirective,
    MouseleaveDirective,
    MouseoverDirective,
    RefDirective,
  ],

  tree(element, component = null) {
    const attributes = element.attributes;

    // v-static stops tree walking for improved performance
    if (attributes['v-static'] != null) return;

    // Loop through directives (so we can control parse order)
    this.directives.forEach((d) => {
      element.attributes.forEach((_, attr) => {
        const name = attr.name;
        const value = attr.value;

        if (name.startsWith(d.name)) {
          // Initialize and parse the directive
          const directive = new d(element, name, value, component);

          // Re-assign component (for v-component directives)
          component = directive.component;
        }
      });
    });

    this.children(element, component);
  },

  children(element, component) {
    element.children.forEach((_,el) => {
      // Continue checking the
      // element's children
      if (typeof el === 'object') {
        // Only check nodes
        this.tree(el, component);
      }
    });
  }
};
