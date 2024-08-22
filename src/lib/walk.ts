import Timer from './timer';
import Directive from '../directives/directive';
import ForDirective from '../directives/display/for';
import ComponentDirective from '../directives/component/component';
import DataDirective from '../directives/component/data';
import FunctionDirective from '../directives/component/function';
import AttrDirective from '../directives/display/attr';
import IfDirective from '../directives/display/conditional/if';
import SyncDirective from '../directives/display/sync';
import OnDirective from '../directives/on';
import RefDirective from '../directives/ref';
import Component from '../components/component';
import ComponentRegistry from '../components/registry';
import {
  RenderController,
  isRenderController,
} from '../rendering/render-controller';
import ElseDirective from '../directives/display/conditional/else';
import ElseIfDirective from '../directives/display/conditional/else-if';
import { Vivere } from '../vivere';

declare global {
  interface Element {
    $directives?: Directive[];
  }
}

const directives: (typeof Directive)[] = [
  // v-for must be first since all other directives on the template
  // element are deferred until the list is rendered
  ForDirective,
  // v-component must be second since all other directives should
  // point to the new component
  ComponentDirective,
  // Data directives must come next to ensure data is probably set up
  // before rendering (especially for defered rendering)
  DataDirective,
  FunctionDirective,
  RefDirective,
  // v-if (and v-else-if and v-else) need to be the first display directive since we
  // can defer futher rendering and hydrating until the element comes into view
  IfDirective,
  ElseIfDirective,
  ElseDirective,
  // For the remaining directives, order is irrelevant
  AttrDirective,
  SyncDirective,
  OnDirective,
];

const Walk = {
  tree(
    element: Element,
    component?: Component,
    renderController?: RenderController,
  ): void {
    Timer.time('Tree parsed', () => {
      // Walk the tree to initialize components
      Walk.element(element, component, renderController);

      // Connect any new components
      ComponentRegistry.components.forEach(c => {
        c.$$connect();
      });
    });
  },

  element(
    element: Element,
    component?: Component,
    renderController?: RenderController,
  ): void {
    const { attributes } = element;
    const { options } = Vivere;
    const { prefix } = options;

    let $component = component;
    let $renderController = renderController;

    // v-static stops tree walking for improved performance
    if (attributes[`${prefix}static`] != null) return;
    // Remove v-hide attributes
    element.removeAttribute('v-hide');

    // Track which directives we've found so we can parse them in order
    const parsedDirectives: {
      Dir: typeof Directive;
      name: string;
      value: string;
    }[] = [];

    // Looping through element attributes is way faster then looping
    // through every directive for every element
    Object.values(element.attributes).forEach(attr => {
      const { name, value } = attr;
      // Explicitly break early if we encounter the most
      // common HTML attributes
      if (['class', 'id'].includes(name)) return;

      // Check for every directive we have registered
      for (let i = 0; i < directives.length; i += 1) {
        const Dir = directives[i];
        const id = `${Vivere.options.prefix}${Dir.id}`;
        const shortcut = Dir.shortcut || `*${Dir.id}`;

        if (name.startsWith(id) || name.startsWith(shortcut)) {
          parsedDirectives.push({ Dir, name, value });
          break;
        }
      }
    });

    if (parsedDirectives.length) {
      element.$directives = [];

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
        const directive = new Dir(
          element,
          name,
          value,
          $component,
          $renderController,
        );

        // Add the directive to the element for tracking
        element.$directives?.push(directive);

        // Re-assign component (for v-component directives)
        $component = directive.component;

        if (isRenderController(directive)) $renderController = directive;
      });
    }

    if (
      !(element instanceof HTMLElement) ||
      element.dataset[Directive.DATA_SUSPEND_PARSING] !== 'true'
    )
      Walk.children(element, $component, $renderController);
  },

  children(
    element: Element,
    component: Component,
    renderController?: RenderController,
  ): void {
    Object.values(element.children).forEach(child => {
      // Continue checking the element's children
      Walk.element(child, component, renderController);
    });
  },
};

export default Walk;
