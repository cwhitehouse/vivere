import ComponentInterface from './interface';
import ComponentContext from './component-context';
import PassedInterface from './definition/passed-interface';
import StoredInterface from './definition/stored-interface';

export default abstract class Component implements ComponentInterface {
  $element: Element;
  $parent?: ComponentContext;
  $children: [ComponentContext?];
  $refs: { [key: string]: (Element | Component) };

  stored?: { [key: string]: StoredInterface };
  passed?: { [ley: string]: PassedInterface };

  beforeConnected?(): void;
  connected?(): void;

  beforeDestroyed?(): void;
  destroyed?(): void;

  beforeDehydrated?(): void;
  dehydrated?(): void;

  $set: (key: string, value: unknown) => void;
  $emit: (event: string, arg: unknown) => void;
  $attach: (html: string, ref: string) => void;
  $nextRender: (func: () => void) => void;
  $destroy: () => void;
}
