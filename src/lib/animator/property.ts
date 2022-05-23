export default class AnimatorProperty {
  element: HTMLElement;

  property: string;
  defaultValue: string | number;

  constructor(element: HTMLElement, property: string) {
    // Track the element to simplify updates
    this.element = element;

    // Track the property and its initial value
    this.property = property;
    this.defaultValue = element.style[property];
  }

  revert(): void {
    const { element, property, defaultValue } = this;
    element.style[property] = defaultValue;
  }
}
