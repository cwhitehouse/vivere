import { CallbacksInterface } from './definition/callbacks-interface';
export default class Callbacks implements CallbacksInterface {
    beforeConnected?: () => void;
    connected?: () => void;
    beforeDestroyed?: () => void;
    destroyed?: () => void;
    beforeDehydrated?: () => void;
    dehydrated?: () => void;
    constructor({ beforeConnected, connected, beforeDestroyed, destroyed, beforeDehydrated, dehydrated, }: CallbacksInterface);
}
