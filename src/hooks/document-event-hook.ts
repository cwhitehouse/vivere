import { VivereHook, VivereComponent } from '../vivere';

interface DocumentEventHookArgs {
  event: string;
  callback: (...args: unknown[]) => void;
}

export default class DocumentEventHook extends VivereHook<DocumentEventHookArgs, void> {
  event: string;
  callback: (...args: unknown[]) => void;

  constructor(component: VivereComponent, args: DocumentEventHookArgs) {
    super(component);

    this.event = args.event;
    this.callback = args.callback.bind(component);
  }

  connected(): void {
    document.addEventListener(this.event, this.callback);
  }

  beforeDestroyed(): void {
    document.removeEventListener(this.event, this.callback);
  }
}
