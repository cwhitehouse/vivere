import Component from './component';

const $components = new Set<Component>();

export default {
  get components(): Set<Component> {
    return $components;
  },

  track(component: Component): void {
    $components.add(component);
  },

  untrack(component: Component): void {
    $components.delete(component);
  },
};
