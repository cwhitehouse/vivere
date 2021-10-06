import Reactive from './reactive';

export default interface ReactiveHostInterface {
  $reactives: { [key: string]: Reactive };
}
