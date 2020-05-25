export default {
    conditionallyRender(host, show) {
        let newNode;
        if (show)
            newNode = host.element;
        else
            newNode = host.placeholder;
        if (newNode !== host.current) {
            host.container.replaceChild(newNode, host.current);
            host.current = newNode;
        }
    },
    toggleClass(element, className, add) {
        if (add)
            element.classList.add(className);
        else
            element.classList.remove(className);
    },
};
