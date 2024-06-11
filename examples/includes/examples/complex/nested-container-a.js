import { Component } from "../../../../src/vivere";

export default class extends Component {
  communique = null;

  onCommuniqueChanged() {
    console.log('Nested Container A detected a change to communique...');
  }
}