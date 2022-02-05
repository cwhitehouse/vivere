import Directive from '../directives/directive';
import ForDirective from '../directives/display/for';
import ComponentDirective from '../directives/component/component';
import BindDirective from '../directives/component/bind';
import DataDirective from '../directives/component/data';
import PassDirective from '../directives/component/pass';
import StoreDirective from '../directives/component/store';
import AttrDirective from '../directives/display/attr';
import ClassDirective from '../directives/display/class';
import DisabledDirective from '../directives/display/disabled';
import HrefDirective from '../directives/display/href';
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
  DataDirective,
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
  ShowDirective,
  SrcDirective,
  StyleDirective,
  SyncDirective,
  TextDirective,
];

const Walk = {
  tree(element: Element, component?: VivereComponent): void {
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

    if (!(element instanceof HTMLElement) || element.dataset[Directive.DATA_SUSPEND_PARSING] !== 'true')
      Walk.children(element, $component);
  },

  children(element: Element, component: VivereComponent): void {
    Object.values(element.children).forEach((child) => {
      // Continue checking the element's children
      Walk.tree(child, component);
    });
  },
};

export default Walk;
