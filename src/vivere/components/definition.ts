import { PassedInterface } from "./definition/passed-interface";
import { CallbacksInterface } from "./definition/callbacks-interface";

export interface ComponentDefintion extends CallbacksInterface {
  passed?:    { prop: PassedInterface };
  data?:      { prop: any };
  computed?:  { prop: () => any };
  methods?:   { prop: (...args: any[]) => any[] };
  watch?:     { prop: () => void };
};
