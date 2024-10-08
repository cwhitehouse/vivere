import { Vivere } from '../vivere';
import AnimatableProperty from './animator/animatable-property';
import AnimatorProperty from './animator/property';

export default class Animator {
  element: HTMLElement;
  vertical: boolean;
  callback: (showing: boolean) => void;

  duration: number;

  showing: boolean;

  property: AnimatableProperty;

  firstMargin: AnimatableProperty;
  secondMargin: AnimatableProperty;
  firstPadding: AnimatableProperty;
  secondPadding: AnimatableProperty;
  firstBorder: AnimatableProperty;
  secondBorder: AnimatableProperty;
  opacity: AnimatableProperty;

  overflow: AnimatorProperty;
  transition: AnimatorProperty;

  startTime: number;
  frameRequest?: number;

  running = false;

  constructor(
    element: HTMLElement,
    vertical: boolean,
    callback: (showing: boolean) => void,
  ) {
    this.element = element;
    this.vertical = vertical;
    this.callback = callback;

    this.duration = Vivere.options.animationDuration;
  }

  start(showing: boolean): void {
    const { element, vertical } = this;

    // Save our current direction
    this.showing = showing;

    // Set up the core property we'll be animating
    const property = vertical ? 'height' : 'width';
    const currentPropertyValue = vertical
      ? element.offsetHeight
      : element.offsetWidth;
    this.property = new AnimatableProperty(
      element,
      property,
      showing ? 0 : currentPropertyValue,
      showing ? currentPropertyValue : 0,
    );

    // Extract our computed styles
    const computedStyle = window.getComputedStyle(element);
    const computedProperties = {
      firstMargin: vertical ? 'marginTop' : 'marginLeft',
      secondMargin: vertical ? 'marginBottom' : 'marginRight',
      firstPadding: vertical ? 'paddingTop' : 'paddingLeft',
      secondPadding: vertical ? 'paddingBottom' : 'paddingRight',
      firstBorder: vertical ? 'borderTopWidth' : 'borderLeftWidth',
      secondBorder: vertical ? 'borderBottomWidth' : 'borderRightWidth',
    };

    Object.entries(computedProperties).forEach(([name, propertyName]) => {
      const currentValue = parseInt(computedStyle[propertyName], 10);

      this[name] = new AnimatableProperty(
        element,
        propertyName,
        showing ? 0 : currentValue,
        showing ? currentValue : 0,
      );
    });

    // Set up opacity for better dissapearing tricks
    const opacityProperty = 'opacity';
    const currentOpacity = parseFloat(computedStyle[opacityProperty]);
    this.opacity = new AnimatableProperty(
      element,
      opacityProperty,
      showing ? 0 : currentOpacity,
      showing ? currentOpacity : 0,
    );

    // Adjust overflow property for more seamless animation
    const overflowProperty = vertical ? 'overflow-y' : 'overflow-x';
    this.overflow = new AnimatorProperty(element, overflowProperty);
    element.style.setProperty(overflowProperty, 'hidden', 'important');

    // Adjust transition property avoid conflicts with manual animation
    const transitionProperty = 'transition';
    this.transition = new AnimatorProperty(element, transitionProperty);
    element.style.setProperty(transitionProperty, 'none', 'important');

    // Save the time we're starting our animation
    this.startTime = new Date().getTime();

    // Start iterating on our animations
    this.running = true;
    this.#iterate();
  }

  get animatableProperties(): AnimatableProperty[] {
    const {
      property,
      firstMargin,
      secondMargin,
      firstPadding,
      secondPadding,
      firstBorder,
      secondBorder,
      opacity,
    } = this;

    return [
      property,
      firstMargin,
      secondMargin,
      firstPadding,
      secondPadding,
      firstBorder,
      secondBorder,
      opacity,
    ].filter(p => p != null);
  }

  get properties(): AnimatorProperty[] {
    const { animatableProperties, overflow, transition } = this;

    return [...animatableProperties, overflow, transition].filter(
      p => p != null,
    );
  }

  #iterate(): void {
    const { animatableProperties, duration, startTime } = this;

    // Calculate percentage of animation
    const elapsedTime = new Date().getTime() - startTime;
    const percentageElapsed = elapsedTime / duration;

    if (percentageElapsed < 1) {
      // hardcoded values from tailwind ease-out function
      const percentageAnimated = this.#animationCurve(percentageElapsed);

      // Update our properties based on percentage elapsed
      animatableProperties.forEach(p => p.update(percentageAnimated));

      // Wait for our next animation frame
      this.frameRequest = requestAnimationFrame(() => {
        this.#iterate();
      });
    } else this.onComplete();
  }

  #animationCurve(t: number): number {
    return t;
  }

  cancel(): void {
    if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
    this.onComplete();
  }

  reverse(): void {
    const { showing, animatableProperties } = this;
    // Reverse the direction we're tracking
    this.showing = !showing;

    // Reverse the directions of all of our animatable properties
    animatableProperties.forEach(p => p.reverse());

    // Update our start time, so our animation percentage resets
    this.startTime = new Date().getTime();
  }

  onComplete(): void {
    const { callback, showing, properties } = this;

    // Revert all of our properties to their original values
    properties.forEach(p => p.revert());

    // Invoke our completion callback
    this.running = false;
    callback(showing);
  }
}
