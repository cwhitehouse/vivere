export class Registry<T> {
  $array: Array<T>;
  $map:   object;

  constructor() {
    this.$array = [];
    this.$map = {};
  }


  // Hook registration

  register(key: any, value: T) {
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

  deregister(key: any) {
    const index = this.$array.indexOf(key);
    this.$map[index] = null;
    this.$array.splice(index, 1);
  }


  // Retrieving hooks

  get(key: any) {
    const index = this.$array.indexOf(key);
    return this.$map[index];
  }


  // Iterator

  forEach(func: Function) {
    const { $array, $map } = this;

    for (var i = 0; i < $array.length ; i++) {
      const key = $array[i];
      if (key != null) {
        const value = $map[i];
        func(key, value);
      }
    }
  }
};
