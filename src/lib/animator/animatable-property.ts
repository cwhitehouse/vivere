import AnimatorProperty from './property';

export default class AnimatableProperty extends AnimatorProperty {
  origin: number;
  destination: number;

  from: number;
  current: number;
  to: number;

  constructor(element: HTMLElement, property: string, from: number, to: number) {
    super(element, property);

    // The from value will also be the origin
    // and the current value when instantiating
    this.origin = from;
    this.from = from;
    this.current = from;

    // The to value will also be the destination
    // when instantiating
    this.destination = to;
    this.to = to;
  }

  update(percentage: number): void {
    const { element, property, from, to } = this;

    // Update the current value based on percentage of animation
    this.current = ((to - from) * percentage) + from;

    // Update the elements style
    element.style[property] = `${this.current}px`;
  }

  reverse(): void {
    const { origin, current, destination } = this;

    // We're animating FROM the current value
    this.from = current;

    // We're animating back TO the origin
    this.to = origin;

    // Swap our origin and destination in case this
    // gets reversed again
    this.origin = destination;
    this.destination = origin;
  }
}
