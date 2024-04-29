import VivereComponent from '../components/vivere-component';

interface Hook<T> {
  attach?(): T;
  connected?(): void;
  rendered?(): void;
  beforeDehydrated?(): void;
  beforeDestroyed?(): void;
}

type HookConstructor<U, T> = (component: VivereComponent, ...args: U) => Hook<T>;

export { HookConstructor, Hook };
