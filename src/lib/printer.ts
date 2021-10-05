class Printer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;

  except: string[];

  only: string[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get properties(): { key: string; value: any }[] {
    const { except, only, value } = this;

    if (value == null)
      return [];

    return Object.entries(value).sort().map(([k, v]) => {
      if ((!only || only.includes(k)) && (!except || !except.includes(k)))
        return { key: k, value: v };

      return null;
    }).filter((v) => v != null);
  }

  get propertiesString(): string {
    const { properties, valueString } = this;
    return properties
      .filter((p) => !p.key.startsWith('$'))
      .map((p) => `· ${p.key}\n\t  ↳ ${valueString(p.value)}`)
      .join('\n  ');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  print(value: unknown, except?: string[], only?: string[]): string {
    return new Printer(value, except, only).print();
  },
};
