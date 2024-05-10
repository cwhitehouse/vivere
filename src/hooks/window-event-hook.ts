import { VivereHook, VivereComponent } from '../vivere';

type WindowEventHookArgs = {
  event: string
  callback: (...args: unknown[]) => void
};

export default class WindowEventHook extends VivereHook<WindowEventHookArgs, void> {
  event: string;
  callback: (...args: unknown[]) => void;

  constructor(component: VivereComponent, args: WindowEventHookArgs) {
    super(component);

    this.event = args.event;
    this.callback = args.callback.bind(component);
  }

  connected(): void {
    window.addEventListener(this.event, this.callback);
  }

  beforeDestroyed(): void {
    window.removeEventListener(this.event, this.callback);
  }
}
