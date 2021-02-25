import Component from './components/component';
import Registry from './reactivity/registry';
import { ComponentDefintion } from './components/definition';
interface VivereInterface {
    $components?: Set<Component>;
    $definitions?: Registry<string, ComponentDefintion>;
    register: (name: string, definition: ComponentDefintion) => void;
    $track: (component: Component) => void;
    $untrack: (component: Component) => void;
    $getDefinition: (name: string) => ComponentDefintion;
}
declare global {
    interface Window {
        $vivere: VivereInterface;
    }
}
declare const Vivere: VivereInterface;
export default Vivere;
