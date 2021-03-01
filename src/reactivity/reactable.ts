import Reactive from './reactive';

export default interface Reactable {
  $reactives?: { [key: string]: Reactive };
}
