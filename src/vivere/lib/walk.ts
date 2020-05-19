import { Directive } from '../directives/directive';

import { ComponentDirective } from '../directives/component/component';
import { BindDirective } from '../directives/component/bind';
import { DataDirective } from '../directives/component/data';
import { PassDirective } from '../directives/component/pass';
import { ClassDirective } from '../directives/display/class';
import { DisabledDirective } from '../directives/display/disabled';
import { IfDirective } from '../directives/display/if';
import { SyncDirective } from '../directives/display/sync';
import { TextDirective } from '../directives/display/text';
import { ClickDirective } from '../directives/event/click';
import { KeydownDirective } from '../directives/event/keydown';
import { MouseenterDirective } from '../directives/event/mouseenter';
import { MouseleaveDirective } from '../directives/event/mouseleave';
import { MouseoverDirective } from '../directives/event/mouseover';
import { RefDirective } from '../directives/ref';

import { Component } from '../component';

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
    KeydownDirective,
    MouseenterDirective,
    MouseleaveDirective,
    MouseoverDirective,
    RefDirective,
  ],

  tree(element: HTMLElement, component?: Component) {
    const attributes = element.attributes;

    // v-static stops tree walking for improved performance
    if (attributes['v-static'] != null) return;

    // Loop through directives (so we can control parse order)
    this.directives.forEach((d) => {
      element.attributes.forEach((_, attr) => {
        const name = attr.name;
        const value = attr.value;

        if (name.startsWith(d.id)) {
          // Initialize and parse the directive
          const directive = new d(element, name, value, component);

          // Re-assign component (for v-component directives)
          component = directive.component;
        }
      });
    });

    this.children(element, component);
  },

  children(element: HTMLElement, component: Component) {
    element.children.forEach((_, el) => {
      // Continue checking the
      // element's children
      if (typeof el === 'object') {
        // Only check nodes
        this.tree(el, component);
      }
    });
  }
};
