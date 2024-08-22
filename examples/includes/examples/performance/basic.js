import { Component } from '../../../../src/vivere';

export default class extends Component {
  data;

  filter = '';

  color = 'text-black';

  limitText = 256;

  get limit() {
    const { limitText } = this;
    return parseInt(limitText, 10);
  }

  get lowerFilter() {
    const { filter } = this;
    return filter.toLowerCase();
  }

  get slicedData() {
    const { data, limit } = this;
    return data.slice(0, limit / 2 / 2);
  }

  get filteredList() {
    const { lowerFilter, slicedData } = this;

    if (!lowerFilter?.length) return slicedData;

    return slicedData.filter(e => {
      if (this.doesEntryMatch(e, lowerFilter)) return true;

      if (e && e.data)
        for (let i = 0; i < e.data.length; i += 1) {
          const $e = e.data[i];

          if (this.doesEntryMatch($e, lowerFilter)) return true;

          if ($e && $e.data)
            for (let j = 0; j < $e.data.length; j += 1) {
              const $$e = $e.data[j];
              if (this.doesEntryMatch($$e, lowerFilter)) return true;
            }
        }
    });
  }

  get colorClass() {
    const { color } = this;
    return [color];
  }

  onLimitTextChanged() {
    this.$log(`Vivere | Testing ${this.limit} items...`);
  }

  doesEntryMatch(entry, filter) {
    if (!entry) return false;

    const { string } = entry;
    const lowerString = string.toLowerCase();

    return lowerString.includes(filter);
  }

  toggleColor() {
    const { color } = this;

    if (color == 'text-blue-600') this.color = 'text-black';
    else this.color = 'text-blue-600';
  }
}
