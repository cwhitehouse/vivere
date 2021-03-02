import Reactive from '../../reactivity/reactive';
import PassedInterface from './passed-interface';

export default interface ReactivePassedInterface extends PassedInterface {
  $reactive?: Reactive;
}
