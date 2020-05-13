export class Reactive {
  constructor(value, hook) {
    Object.assign(this, {
      hook,
      value,
    });
  }

  get() {
    return value;
  }

  set(value) {
    if (value !== this.value) {
      const oldValue = this.value;
      this.value = value;
      this.hook?.(oldValue, value);
    }
  }
}
