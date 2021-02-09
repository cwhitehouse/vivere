import { PassedInterface } from './definition/passed-interface';
import { CallbacksInterface } from './definition/callbacks-interface';
import { StoredInterface } from './definition/stored-interface';
export interface ComponentDefintion extends CallbacksInterface {
    passed?: {
        prop: PassedInterface;
    };
    data?: () => {
        prop: unknown;
    };
    stored?: {
        prop: StoredInterface;
    };
    computed?: {
        prop: () => unknown;
    };
    methods?: {
        prop: (...args: unknown[]) => unknown[];
    };
    watch?: {
        prop: () => void;
    };
}
