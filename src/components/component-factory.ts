import Component from './component';
import ComponentContext from './component-context';
import properties from '../lib/properties';
import ComponentError from '../errors/component-error';

const factory = (context: ComponentContext, name: string, Definition: typeof Component): Component => {
  try {
    class ComponentInstance extends Definition {
      get $children(): Component[] {
        return context.children.map((c) => c.component);
      }

      get $element(): Element {
        return context.element;
      }

      get $parent(): Component {
        const { parent } = context;

        if (parent == null) return null;
        return parent.component;
      }

      get $refs(): { [key: string]: Element | Component } {
        return context.refs;
      }

      get $name(): string {
        return name;
      }

      $set(key: string, value: any): void {
        context.$set(key, value, this);
        // Track this data so we can save it
        // if this component is dehydrated
        context.dataKeys.add(key);
      }

      $emit(event: string, arg: unknown): void {
        context.$emit(event, arg);
      }

      $attach(html: string, ref: string): void {
        context.$attach(html, ref);
      }

      $nextRender(func: () => void): void {
        context.$nextRender(func);
      }

      $destroy(): void {
        context.$destroy();
      }
    }
    const instance = new ComponentInstance();

    properties.parse(instance, (key, descriptor) => {
      // Ignore reserved keys, like stored, passed, constructor
      if (ComponentContext.$reserved.includes(key)) {
        context.$reserveProperty(key, descriptor);
        return;
      }

      const { get, value } = descriptor;
      // A getter implies a computed property
      if (get != null)
        context.compute(key, get, instance);
      else if (typeof value !== 'function')
        instance.$set(key, value);
      else
        instance[key] = value;
    });

    return instance;
  } catch (err) {
    throw new ComponentError('A component definition must be a class that extends Component', Definition, err);
  }
};

export default factory;
