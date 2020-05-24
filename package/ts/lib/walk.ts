import Component from '../components/component';
import Directive from '../directives/directive';
import ComponentDirective from '../directives/component/component';
import BindDirective from '../directives/component/bind';
import DataDirective from '../directives/component/data';
import PassDirective from '../directives/component/pass';
import ClassDirective from '../directives/display/class';
import DisabledDirective from '../directives/display/disabled';
import FilterDirective from '../directives/display/filter';
import HrefDirective from '../directives/display/href';
import IfDirective from '../directives/display/if';
import ShowDirective from '../directives/display/show';
import SortDirective from '../directives/display/sort';
import SyncDirective from '../directives/display/sync';
import TextDirective from '../directives/display/text';
import BlurDirective from '../directives/event/blur';
import ClickDirective from '../directives/event/click';
import FocusDirective from '../directives/event/focus';
import KeydownDirective from '../directives/event/keydown';
import MouseenterDirective from '../directives/event/mouseenter';
import MouseleaveDirective from '../directives/event/mouseleave';
import MouseoverDirective from '../directives/event/mouseover';
import RefDirective from '../directives/ref';

const directives: (typeof Directive)[] = [
  ComponentDirective,
  BindDirective,
  DataDirective,
  PassDirective,
  ClassDirective,
  DisabledDirective,
  FilterDirective,
  HrefDirective,
  IfDirective,
  ShowDirective,
  SortDirective,
  SyncDirective,
  TextDirective,
  BlurDirective,
  ClickDirective,
  FocusDirective,
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
