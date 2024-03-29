import Timer from './timer';
import Directive from '../directives/directive';
import ForDirective from '../directives/display/for';
import ComponentDirective from '../directives/component/component';
import BindDirective from '../directives/component/bind';
import ComputeDirective from '../directives/component/compute';
import DataDirective from '../directives/component/data';
import MethodDirective from '../directives/component/method';
import PassDirective from '../directives/component/pass';
import StoreDirective from '../directives/component/store';
import AttrDirective from '../directives/display/attr';
import ClassDirective from '../directives/display/class';
import DisabledDirective from '../directives/display/disabled';
import HrefDirective from '../directives/display/href';
import HtmlDirective from '../directives/display/html';
import IfDirective from '../directives/display/if';
import ShowDirective from '../directives/display/show';
import SrcDirective from '../directives/display/src';
import StyleDirective from '../directives/display/style';
import SyncDirective from '../directives/display/sync';
import TextDirective from '../directives/display/text';
import EventDirective from '../directives/event';
import HideDirective from '../directives/hide';
import RefDirective from '../directives/ref';
import VivereComponent from '../components/vivere-component';
import ComponentRegistry from '../components/registry';

const directives: (typeof Directive)[] = [
  // v-for must be first since all other directives on the template
  // element are deferred until the list is rendered
  ForDirective,
  // v-component must be second since all other directives should
  // point to the new component
  ComponentDirective,
  // Data directives must come next to ensure data is probably set up
  // before rendering (especially for defered rendering)
  BindDirective,
  ComputeDirective,
  DataDirective,
  MethodDirective,
  PassDirective,
  RefDirective,
  StoreDirective,
  // v-if needs to be the first display directive since we can defer
  // futher rendering and hydrating until the element comes into view
  IfDirective,
  // For the remaining directives, order is irrelevant
  AttrDirective,
  ClassDirective,
  DisabledDirective,
  EventDirective,
  HideDirective,
  HrefDirective,
  HtmlDirective,
  ShowDirective,
  SrcDirective,
  StyleDirective,
  SyncDirective,
  TextDirective,
];

const Walk = {
  tree(element: Element, component?: VivereComponent): void {
    Timer.time('Tree parsed', () => {
      // Walk the tree to initialize components
      Walk.element(element, component);

      // Connect any new components
      ComponentRegistry.components.forEach((c) => { c.$connect(); });
    });
  },

  element(element: Element, component?: VivereComponent): void {
    const { attributes } = element;
    let $component = component;

    // v-static stops tree walking for improved performance
    if (attributes['v-static'] != null) return;

    // Track which directives we've found so we can parse them in order
    const parsedDirectives: { Dir: typeof Directive, name: string, value: string }[] = [];

    // Looping through element attributes is way faster then looping
    // through every directive for every element
    Object.values(element.attributes).forEach((attr) => {
      const { name, value } = attr;
      // 'class' is our most common attribute, so we'll add a special
      // case exception for noticing class
      if (name === 'class') return;

      // Check for every directive we have registered
      directives.forEach((Dir) => {
        if (name.startsWith(Dir.id))
          parsedDirectives.push({ Dir, name, value });
      });
    });

    if (parsedDirectives.length) {
      // Parse the directives in the proper order
      parsedDirectives.sort((a, b) => {
        const aIdx = directives.indexOf(a.Dir);
        const bIdx = directives.indexOf(b.Dir);

        if (aIdx > bIdx) return 1;
        if (aIdx === bIdx) return 0;
        return -1;
      });

      // Initialize every directive
      parsedDirectives.forEach(({ Dir, name, value }) => {
        // Initialize and parse the directive
        const directive = new Dir(element, name, value, $component);

        // Re-assign component (for v-component directives)
        $component = directive.component;
      });
    }

    if (!(element instanceof HTMLElement) || element.dataset[Directive.DATA_SUSPEND_PARSING] !== 'true')
      Walk.children(element, $component);
  },

  children(element: Element, component: VivereComponent): void {
    Object.values(element.children).forEach((child) => {
      // Continue checking the element's children
      Walk.element(child, component);
    });
  },
};

export default Walk;
