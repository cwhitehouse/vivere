export class Registry<T,V> {
  $array: Array<T>;
  $map:   { prop?: V };

  constructor() {
    this.$array = [];
    this.$map = {};
  }


  // Hook registration

  register(key: T, value: V) {
    // Check if key already exists
    let index = this.$array.indexOf(key);

    if (index < 0) {
      // If not, add our key to the array
      index = this.$array.length;
      this.$array.push(key);
    }

    // Assign our value to the map
    this.$map[index] = value;
  }

  deregister(key: T) {
    const index = this.$array.indexOf(key);
    this.$map[index] = null;
    this.$array.splice(index, 1);
  }


  // Retrieving hooks

  get(key: T) {
    const index = this.$array.indexOf(key);
    return this.$map[index];
  }


  // Iterator

  forEach(func: (key: T, value: V) => void) {
    const { $array, $map } = this;

    for (var i = 0; i < $array.length ; i++) {
      const registryKey = $array[i];
      if (registryKey != null) {
        const value = $map[i];
        func(registryKey, value);
      }
    }
  }
};
