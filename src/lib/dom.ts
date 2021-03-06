export interface NodeHost {
  element: Element;
  container: Node;
  current: Node;
  placeholder: Node;
}

export default {
  conditionallyRender(host: NodeHost, show: boolean): void {
    let newNode: Node;
    if (show) newNode = host.element;
    else newNode = host.placeholder;

    if (newNode !== host.current) {
      host.container.replaceChild(newNode, host.current);
      host.current = newNode;
    }
  },

  toggleClass(element: Element, className: string, add: boolean): void {
    if (add) element.classList.add(className);
    else element.classList.remove(className);
  },
};
