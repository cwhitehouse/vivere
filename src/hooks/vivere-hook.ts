import VivereComponent from '../components/vivere-component';

interface HookConstructor<U, T> {
  new (component: VivereComponent, args: U): VivereHook<U, T>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class VivereHook<U, T> {
  $component: VivereComponent;

  constructor(component: VivereComponent) {
    this.$component = component;
  }

  attach?(): T;
  connected?(): void;
  rendered?(): void;
  beforeDehydrated?(): void;
  beforeDestroyed?(): void;
}

export { HookConstructor, VivereHook };
