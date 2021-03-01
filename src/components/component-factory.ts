import ComponentInterface from './interface';
import Component from './component';
import ComponentContext from './component-context';

const parseProperties = (entity: any, context: ComponentContext, instance: Component): void => {
  const propertyDescriptors = Object.getOwnPropertyDescriptors(entity);
  const propertyDescriptorEntries = Object.entries(propertyDescriptors);
  propertyDescriptorEntries.forEach(([key, descriptor]) => {
    // Ignore reserved keys, like stored, passed, constructor
    if (context.$reserved.includes(key)) {
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
};

const factory = (context: ComponentContext, definition: ComponentInterface): Component => {
  class ComponentInstance implements Component {
    get $children(): [ComponentContext?] {
      return context.children;
    }

    get $element(): Element {
      return context.element;
    }

    get $parent(): ComponentContext {
      return context.parent;
    }

    get $refs(): { [key: string]: Element | Component } {
      return context.refs;
    }

    $set(key: string, value: unknown): void {
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

  let entity;
  try {
    entity = new definition();
    parseProperties(entity, context, instance);

    entity = definition.prototype;
    parseProperties(entity, context, instance);
  } catch (err) {
    entity = definition;
    parseProperties(entity, context, instance);
  }

  return instance;
};

export default factory;
