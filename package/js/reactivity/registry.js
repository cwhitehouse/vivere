export default class Registry {
    constructor() {
        this.$array = [];
        this.$map = {};
    }
    // Hook registration
    register(key, value) {
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
    deregister(key) {
        const index = this.$array.indexOf(key);
        this.$map[index] = null;
        this.$array.splice(index, 1);
    }
    // Retrieving hooks
    get(key) {
        const index = this.$array.indexOf(key);
        return this.$map[index];
    }
    // Iterator
    forEach(func) {
        const { $array, $map } = this;
        for (let i = 0; i < $array.length; i += 1) {
            const registryKey = $array[i];
            if (registryKey != null) {
                const value = $map[i];
                func(registryKey, value);
            }
        }
    }
}
