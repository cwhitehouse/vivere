class Printer {
  value: any;
  keys: string[];

  constructor(value: any, keys: string[]) {
    this.value = value;
    this.keys = keys;
  }

  get typeLabel(): string {
    const { value } = this;

    if (value == null)
      return 'null';

    if (typeof value === 'object')
      if (value.constructor != null)
        return value.constructor.name;

    return typeof value;
  }

  get properties(): { key: string; value: any }[] {
    const { keys, value } = this;

    if (value == null)
      return [];

    return Object.getOwnPropertyNames(value).sort().map((key) => {
      if (!keys || keys.includes(key)) {
        const val = value[key];
        return { key, value: val };
      }
      return null;
    }).filter(v => v != null);
  }

  get propertiesString(): string {
    const { properties, valueString } = this;
    return properties.map((p) => `· ${p.key}\n\t  ↳ ${valueString(p.value)}`).join('\n  ');
  }

  valueString(val: any): string {
    if (val == null) return 'null';
    if (Array.isArray(val)) return '[]';
    if (typeof val === 'function') return 'f()';
    return JSON.stringify(val);
  }

  print(): string {
    const { typeLabel, value } = this;
    if (typeLabel === 'string')
      return `↳ "${value}"`;
    if (typeLabel === 'number' || typeLabel === 'number')
      return `↳ ${value}`;

    const { propertiesString } = this;

    return `${typeLabel}
  ${propertiesString}`;
  }
}

export default {
  print(value: any, keys?: string[]): string {
    return new Printer(value, keys).print();
  },
};
