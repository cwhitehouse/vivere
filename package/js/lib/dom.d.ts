export interface NodeHost {
    element: Element;
    container: Node;
    current: Node;
    placeholder: Node;
}
declare const _default: {
    conditionallyRender(host: NodeHost, show: boolean): void;
    toggleClass(element: Element, className: string, add: boolean): void;
};
export default _default;
