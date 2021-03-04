import PassedInterface from './passed-interface';
import CallbacksInterface from './callbacks-interface';
import StoredInterface from './stored-interface';

export default interface ComponentDefintion extends CallbacksInterface {
  passed?: { prop: PassedInterface };
  data?: () => { prop: unknown };
  stored?: { prop: StoredInterface };
  computed?: { prop: () => unknown };
  methods?: { prop: (...args: unknown[]) => unknown[] };
  watch?: { prop: () => void };
}
