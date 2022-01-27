import Directive from '../directives/directive';
import ComponentDirective from '../directives/component/component';
import ListDirective from '../directives/display/list';
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
  ComponentDirective,
  ListDirective,
  BindDirective,
  DataDirective,
  PassDirective,
  StoreDirective,
  AttrDirective,
  ClassDirective,
  DisabledDirective,
  HrefDirective,
  IfDirective,
  ShowDirective,
  SrcDirective,
  StyleDirective,
  SyncDirective,
  TextDirective,
  EventDirective,
  HideDirective,
  RefDirective,
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
