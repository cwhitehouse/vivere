import { VivereHook, VivereComponent } from '../vivere';

interface RefEventHookArgs {
  ref: string;
  event: string;
  callback: (...args: unknown[]) => void;
}

export default class RefEventHook extends VivereHook<RefEventHookArgs, void> {
  ref: string;
  event: string;
  callback: (...args: unknown[]) => void;

  element?: Element;

  constructor(component: VivereComponent, args: RefEventHookArgs) {
    super(component);

    this.ref = args.ref;
    this.event = args.event;
    this.callback = args.callback.bind(component);
  }

  rendered(): void {
    const $element = this.$component.$refs[this.ref];
    if ($element instanceof Element) {
      this.element = $element;
      this.element.addEventListener(this.event, this.callback);
    }
  }

  beforeDestroyed(): void {
    this.element?.removeEventListener(this.event, this.callback);
  }
}
