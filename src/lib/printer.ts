class Printer {
  value: any;
  except: string[];
  only: string[];

  constructor(value: any, except: string[], only: string[]) {
    this.value = value;
    this.except = except;
    this.only = only;
  }

  get typeLabel(): string {
    const { value } = this;

    if (value == null)
      return 'null';

    if (typeof value === 'object') {
      if (value.$name != null)
        return value.$name;

      if (value.constructor != null)
        return value.constructor.name;
    }

    return typeof value;
  }

  get properties(): { key: string; value: any }[] {
    const { except, only, value } = this;

    if (value == null)
      return [];

    return Object.getOwnPropertyNames(value).sort().map((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (typeof descriptor.value === 'function')
        return null;

      if ((!only || only.includes(key)) && (!except || !except.includes(key))) {
        const { value: val } = descriptor;
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
  print(value: any, except?: string[], only?: string[]): string {
    return new Printer(value, except, only).print();
  },
};