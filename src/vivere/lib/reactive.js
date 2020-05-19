// Class definition

export class Reactive {
  constructor(value, hooks) {
    // Recursively setup reactivity
    if (value != null && typeof value === 'object')
      value.forEach((k,v) => Reactive.set(value, k, v));

    Object.assign(this, {
      value,
      hooks,
    });
  }

  set(value) {
    if (value !== this.value) {
      const oldValue = this.value;
      this.value = value;
      this.hooks?.forEach((hook) => {
        hook(oldValue, value);
      });
    }
  }
}


// Property assignment with reactivity

Reactive.set = (object, key, value, hook) => {
  // Ensure $reactives exists
  if (object.$reactives == null) object.$reactives = {};

  // Check if we've alreadu set up reactivity
  // for this property and object
  if (object.$reactives[key] == null) {
    // Set up this property to use
    // a reactive value under the hood
    object.$reactives[key] = new Reactive(value, hook ? [hook] : []);
    Object.defineProperty(object, key, {
      get() { return object.$reactives[key]?.value; },
      set(newValue) { object.$reactives[key].set(newValue) },
    });
  } else {
    // Property is already reactive,
    // we can just assign to it
    object[key] = value;
  }
};


// Reactivity handoff for passed proeprties

Reactive.pass = (object, key, reactive) => {
  // Ensure $reactives exists
  if (object.$reactives == null) object.$reactives = {};

  // Pass off a Reactive property managed
  // by a different object
  object.$reactives[key] = reactive;
  Object.defineProperty(object, key, {
    get() { return object.$reactives[key]?.value; },
    set(_) { throw "Cannot update passed values from a child"; },
  });
};
