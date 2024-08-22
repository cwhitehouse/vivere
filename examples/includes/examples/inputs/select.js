import { Component, useQueryEncoding } from '../../../../src/vivere';

export default class extends Component {
  value;

  connected() {
    useQueryEncoding(this, { dataKey: 'value', encodingKey: 'v' });
  }

  reset() {
    this.value = 'rome';
  }
}
