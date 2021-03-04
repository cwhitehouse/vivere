import Component from './component';
import ComponentContext from './component-context';
import properties from '../lib/properties';

const factory = (context: ComponentContext, name: string, definition: (typeof Component | object)): Component => {
  class ComponentInstance {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // We need to create an instance of a class if our definition
  // was a class, or we fallback to assuming a definition object
  let entity: object;
  try {
    const Definition = definition as typeof Component;
    entity = new Definition();
  } catch (err) {
    entity = definition;
  }

  properties.parse(entity, (key, descriptor) => {
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
};

export default factory;
