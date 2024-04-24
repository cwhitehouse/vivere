export default class AnimatorProperty {
  element: HTMLElement;

  property: string;
  defaultValue: string;
  defaultPriority?: string;

  constructor(element: HTMLElement, property: string) {
    // Track the element to simplify updates
    this.element = element;

    // Track the property and its initial value
    this.property = property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    this.defaultValue = element.style.getPropertyValue(property);
    this.defaultPriority = element.style.getPropertyPriority(property);
  }

  revert(): void {
    const { element, property, defaultValue, defaultPriority } = this;
    element.style.setProperty(property, defaultValue, defaultPriority);
  }
}
