import Directive from './directives/directive';
declare const Renderer: {
    $queueRender(directive: Directive): void;
    $nextRender(func: () => void): void;
};
export default Renderer;
