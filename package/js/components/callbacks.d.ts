import { CallbacksInterface } from './definition/callbacks-interface';
export default class Callbacks implements CallbacksInterface {
    beforeConnected: () => void;
    connected: () => void;
    beforeDestroyed: () => void;
    destroyed: () => void;
    constructor({ beforeConnected, connected, beforeDestroyed, destroyed, }: {
        beforeConnected: any;
        connected: any;
        beforeDestroyed: any;
        destroyed: any;
    });
}
