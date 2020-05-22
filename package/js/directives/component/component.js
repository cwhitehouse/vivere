import Directive from '../directive';
import Vivere from '../../vivere';
import Component from '../../components/component';
let ComponentDirective = /** @class */ (() => {
    class ComponentDirective extends Directive {
        // Parsing
        parse() {
            // The previous component is now the parent
            const parent = this.component;
            // Instantiate the new component
            this.component = new Component(this.element, this.expression, parent);
            Vivere.$track(this.component);
        }
    }
    ComponentDirective.id = 'v-component';
    ComponentDirective.needsComponent = false;
    return ComponentDirective;
})();
export default ComponentDirective;
