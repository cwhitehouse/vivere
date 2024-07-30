import { Component } from "../../../../src/vivere";

export default class InputsText extends Component {
  beforeConnected() {
    this.$log('InputsText#beforeConnected');
  }

  connected() {
    this.$log('InputsText#connected');
  }

  rendered() {
    this.$log('InputsText#rendered');
    this.$refs.text.focus();
  }

  beforeDestroyed() {
    this.$log('InputsText#beforeDestroyed');
  }

  beforeDehydrated() {
    this.$log('InputsText#beforeDehydrated');
  }

  dehydrated() {
    this.$log('InputsText#dehydrated');
  }

  destroyed() {
    this.$log('InputsText#destroyed');
  }
}
