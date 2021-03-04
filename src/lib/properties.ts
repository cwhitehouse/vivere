const $parse = (entity: object, handler: (key: string, descriptor: PropertyDescriptor) => void, seenKeys: string[]): void => {
  const propertyDescriptors = Object.getOwnPropertyDescriptors(entity);
  const propertyDescriptorEntries = Object.entries(propertyDescriptors);
  propertyDescriptorEntries.forEach(([key, descriptor]) => {
    if (!seenKeys.includes(key)) {
      handler(key, descriptor);
      seenKeys.push(key);
    }
  });
};

export default {
  parse(object: object, handler: (key: string, descriptor: PropertyDescriptor) => void): void {
    const seenKeys: string[] = [];

    // Parse all the object's own properties
    $parse(object, handler, seenKeys);

    // If the object is an instance of a class,
    // we need to parse properties from the
    // class definition
    let prototype = Object.getPrototypeOf(object);
    while (prototype != null && prototype !== Object.prototype) {
      $parse(prototype, handler, seenKeys);
      prototype = Object.getPrototypeOf(prototype);
    }
  },
};
