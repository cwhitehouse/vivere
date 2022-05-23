import AnimatableProperty from './animator/animatable-property';
import AnimatorProperty from './animator/property';

const ANIMATION_DURATION = 150;

export default class Animator {
  element: HTMLElement;
  vertical: boolean;
  callback: (showing: boolean) => void;

  showing: boolean;

  property: AnimatableProperty;

  firstMargin: AnimatableProperty;
  secondMargin: AnimatableProperty;

  overflow: AnimatorProperty;

  startTime: number;
  frameRequest?: number;

  running: boolean = false;

  constructor(element: HTMLElement, vertical: boolean, callback: (showing: boolean) => void) {
    this.element = element;
    this.vertical = vertical;
    this.callback = callback;
  }

  start(showing: boolean): void {
    const { element, vertical } = this;

    // Save our current direction
    this.showing = showing;

    // Set up the core property we'll be animating
    const property = vertical ? 'height' : 'width';
    const currentPropertyValue = vertical ? element.offsetHeight : element.offsetWidth;
    const fromValue = showing ? 0 : currentPropertyValue;
    const toValue = showing ? currentPropertyValue : 0;
    this.property = new AnimatableProperty(element, property, fromValue, toValue);

    // Extract our margin values
    const computedStyle = window.getComputedStyle(element);

    // Set up our first margin property (top or left)
    const firstMarginProperty = vertical ? 'marginTop' : 'marginLeft';
    const currentFirstMarginValue = parseInt(computedStyle[firstMarginProperty], 10);

    const fromFirstMargin = showing ? 0 : currentFirstMarginValue;
    const toFirstMargin = showing ? currentFirstMarginValue : 0;
    this.firstMargin = new AnimatableProperty(element, firstMarginProperty, fromFirstMargin, toFirstMargin);

    // Set up our second margin property (bottom or right)
    const secondMarginProperty = vertical ? 'marginBottom' : 'marginRight';
    const currentSecondMarginValue = parseInt(computedStyle[secondMarginProperty], 10);

    const fromSecondMargin = showing ? 0 : currentSecondMarginValue;
    const toSecondMargin = showing ? currentSecondMarginValue : 0;
    this.secondMargin = new AnimatableProperty(element, secondMarginProperty, fromSecondMargin, toSecondMargin);

    // Adjust overflow property for more seamless animation
    const overflowProperty = vertical ? 'overflow-y' : 'overflow-x';
    this.overflow = new AnimatorProperty(element, overflowProperty);
    element.style[overflowProperty] = 'hidden';

    // Save the time we're starting our animation
    this.startTime = new Date().getTime();

    // Start iterating on our animations
    this.running = true;
    this.#iterate();
  }

  #iterate(): void {
    const {
      property,
      firstMargin,
      secondMargin,
      startTime,
    } = this;

    // Calculate percentage of animation
    const elapsedTime = new Date().getTime() - startTime;
    const percentageElapsed = elapsedTime / ANIMATION_DURATION;

    if (percentageElapsed < 1) {
      // Update our properties based on percentage elapsed
      [property, firstMargin, secondMargin].forEach((p) => p.update(percentageElapsed));

      // Wait for our next animation frame
      this.frameRequest = requestAnimationFrame(() => { this.#iterate(); });
    } else
      this.onComplete();
  }

  cancel(): void {
    if (this.frameRequest)
      cancelAnimationFrame(this.frameRequest);
    this.onComplete();
  }

  reverse(): void {
    const { showing, property, firstMargin, secondMargin } = this;
    // Reverse the direction we're tracking
    this.showing = !showing;

    // Reverse the directions of all of our animatable properties
    [property, firstMargin, secondMargin].forEach((p) => p.reverse());

    // Update our start time, so our animation percentage resets
    this.startTime = new Date().getTime();
  }

  onComplete(): void {
    const {
      callback,
      showing,
      property,
      firstMargin,
      secondMargin,
      overflow,
    } = this;

    // Revert all of our properties to their original values
    [property, firstMargin, secondMargin, overflow].forEach((p) => p.revert());

    // Invoke our completion callback
    this.running = false;
    callback(showing);
  }
}
