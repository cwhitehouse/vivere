import Component from '../components/component';
declare const Walk: {
    tree(element: Element, component?: Component): void;
    children(element: Element, component: Component): void;
};
export default Walk;
