import { Component } from "../../../../src/vivere";

export default class extends Component {
  message;

  onMessageChanged() {
    console.log('Nested Container B detected a change to message...');
  }
}