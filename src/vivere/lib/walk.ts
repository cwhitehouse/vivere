import Directive from '../directives/directive';

import ComponentDirective from '../directives/component/component';
import BindDirective from '../directives/component/bind';
import DataDirective from '../directives/component/data';
import PassDirective from '../directives/component/pass';
import ClassDirective from '../directives/display/class';
import DisabledDirective from '../directives/display/disabled';
import IfDirective from '../directives/display/if';
import SyncDirective from '../directives/display/sync';
import TextDirective from '../directives/display/text';
import ClickDirective from '../directives/event/click';
import KeydownDirective from '../directives/event/keydown';
import MouseenterDirective from '../directives/event/mouseenter';
import MouseleaveDirective from '../directives/event/mouseleave';
import MouseoverDirective from '../directives/event/mouseover';
import RefDirective from '../directives/ref';

import Component from '../components/component';

const directives: (typeof Directive)[] = [
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
  KeydownDirective,
  MouseenterDirective,
  MouseleaveDirective,
  MouseoverDirective,
  RefDirective,
];

const Walk = {
  tree(element: Element, component?: Component): void {
    const { attributes } = element;
    let $component = component;

    // v-static stops tree walking for improved performance
    if (attributes['v-static'] != null) return;

    // Loop through directives (so we can control parse order)
    directives.forEach((Dir) => {
      Object.values(element.attributes).forEach((attr) => {
        const { name } = attr;
        const { value } = attr;

        if (name.startsWith(Dir.id)) {
          // Initialize and parse the directive
          const directive = new Dir(element, name, value, $component);

          // Re-assign component (for v-component directives)
          $component = directive.component;
        }
      });
    });

    Walk.children(element, $component);
  },

  children(element: Element, component: Component): void {
    Object.values(element.children).forEach((child) => {
      // Continue checking the
      // element's children
      if (typeof child === 'object')
        // Only check nodes
        Walk.tree(child, component);
    });
  },
};

export default Walk;
