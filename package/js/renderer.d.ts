import Directive from './directives/directive';
declare const Renderer: {
    $forceRender(): void;
    $queueRender(directive: Directive): void;
    $nextRender(func: () => void): void;
};
export default Renderer;
