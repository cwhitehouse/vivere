class Printer {
  value: any;

  constructor(value) {
    this.value = value;
  }

  get typeLabel(): string {
    const { value } = this;

    if (typeof value === 'object')
      if (value.constructor != null)
        return value.constructor.name;

    return typeof value;
  }

  get properties(): { key: string; value: any }[] {
    const { value } = this;

    return Object.getOwnPropertyNames(value).sort().map((key) => {
      const val = value[key];
      return { key, value: val };
    });
  }

  get propertiesString(): string {
    const { properties, valueString } = this;
    return properties.map((p) => `· ${p.key}\n\t  ↳ ${valueString(p.value)}`).join('\n  ');
  }

  valueString(val: any): string {
    if (val == null) return 'null';
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
  print(value: any) {
    return new Printer(value).print();
  },
};
