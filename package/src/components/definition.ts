import { PassedInterface } from './definition/passed-interface';
import { CallbacksInterface } from './definition/callbacks-interface';

export interface ComponentDefintion extends CallbacksInterface {
  passed?: { prop: PassedInterface };
  data?: () => { prop: unknown };
  computed?: { prop: () => unknown };
  methods?: { prop: (...args: unknown[]) => unknown[] };
  watch?: { prop: () => void };
}
