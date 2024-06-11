import { Component } from "../../../../src/vivere";

export default class InputsText extends Component {
  beforeConnected() {
    console.log('InputsText#beforeConnected');
  }

  connected() {
    console.log('InputsText#connected');
  }

  rendered() {
    console.log('InputsText#rendered');
    this.$refs.text.focus();
  }

  beforeDestroyed() {
    console.log('InputsText#beforeDestroyed');
  }

  beforeDehydrated() {
    console.log('InputsText#beforeDehydrated');
  }

  dehydrated() {
    console.log('InputsText#dehydrated');
  }

  destroyed() {
    console.log('InputsText#destroyed');
  }
}
