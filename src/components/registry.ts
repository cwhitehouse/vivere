import VivereComponent from './vivere-component';

const $components = new Set<VivereComponent>();

export default {
  get components(): Set<VivereComponent> {
    return $components;
  },

  track(component: VivereComponent): void {
    $components.add(component);
  },

  untrack(component: VivereComponent): void {
    $components.delete(component);
  },
};
