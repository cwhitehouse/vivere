import ComponentContext from '../components/component-context';
import Directive from '../directives/directive';
import ComponentDirective from '../directives/component/component';
import BindDirective from '../directives/component/bind';
import DataDirective from '../directives/component/data';
import PassDirective from '../directives/component/pass';
import StoreDirective from '../directives/component/store';
import ClassDirective from '../directives/display/class';
import DisabledDirective from '../directives/display/disabled';
import FilterDirective from '../directives/display/filter';
import HrefDirective from '../directives/display/href';
import IfDirective from '../directives/display/if';
import ShowDirective from '../directives/display/show';
import SortDirective from '../directives/display/sort';
import SrcDirective from '../directives/display/src';
import StyleDirective from '../directives/display/style';
import SyncDirective from '../directives/display/sync';
import TextDirective from '../directives/display/text';
import EventDirective from '../directives/event';
import HideDirective from '../directives/hide';
import RefDirective from '../directives/ref';

const directives: (typeof Directive)[] = [
  ComponentDirective,
  BindDirective,
  DataDirective,
  PassDirective,
  StoreDirective,
  ClassDirective,
  DisabledDirective,
  FilterDirective,
  HrefDirective,
  IfDirective,
  ShowDirective,
  SortDirective,
  SrcDirective,
  StyleDirective,
  SyncDirective,
  TextDirective,
  EventDirective,
  HideDirective,
  RefDirective,
];

const Walk = {
  tree(element: Element, context?: ComponentContext): void {
    const { attributes } = element;
    let $context = context;

    // v-static stops tree walking for improved performance
    if (attributes['v-static'] != null) return;

    // Loop through directives (so we can control parse order)
    directives.forEach((Dir) => {
      Object.values(element.attributes).forEach((attr) => {
        const { name } = attr;
        const { value } = attr;

        if (name.startsWith(Dir.id)) {
          // Initialize and parse the directive
          const directive = new Dir(element, name, value, $context);

          // Re-assign component (for v-component directives)
          $context = directive.context;
        }
      });
    });

    Walk.children(element, $context);
  },

  children(element: Element, context: ComponentContext): void {
    Object.values(element.children).forEach((child) => {
      // Continue checking the
      // element's children
      if (typeof child === 'object')
        // Only check nodes
        Walk.tree(child, context);
    });
  },
};

export default Walk;
