import ComponentInterface from './interface';
import PassedInterface from './definition/passed-interface';
import StoredInterface from './definition/stored-interface';
import ComponentError from '../errors/component-error';

export default class Component implements ComponentInterface {
  stored?: { [key: string]: StoredInterface };
  passed?: { [ley: string]: PassedInterface };

  beforeConnected?(): void;
  connected?(): void;

  beforeDestroyed?(): void;
  destroyed?(): void;

  beforeDehydrated?(): void;
  dehydrated?(): void;

  get $element(): Element { throw new ComponentError('Components must implement `$element`', this); }
  get $parent(): Component { throw new ComponentError('Components must implement `$parent`', this); }
  get $children(): Component[] { throw new ComponentError('Components must implement `$children`', this); }
  get $refs(): { [key: string]: (Element | Component) } { throw new ComponentError('Components must implement `$refs`', this); }

  $set(key: string, value: any): void { throw new ComponentError('Components must implement `$set`', this); }
  $emit(event: string, arg: unknown): void { throw new ComponentError('Components must implement `$emit`', this); }
  $attach(html: string, ref: string): void { throw new ComponentError('Components must implement `$attach`', this); }
  $nextRender(func: () => void): void { throw new ComponentError('Components must implement `$nextRender`', this); }
  $destroy(): void { throw new ComponentError('Components must implement `$destroy`', this); }
}
