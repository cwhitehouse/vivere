import { Component } from '../../../../src/vivere';

export default class extends Component {
  communique = null;

  onCommuniqueChanged() {
    this.$log('Nested Container A detected a change to communique...');
  }
}
