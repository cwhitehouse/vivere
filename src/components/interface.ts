import PassedInterface from './definition/passed-interface';
import CallbacksInterface from './definition/callbacks-interface';
import StoredInterface from './definition/stored-interface';

export default interface ComponentInterface extends CallbacksInterface {
  passed?: { [key: string]: PassedInterface };
  stored?: { [key: string]: StoredInterface };
}
