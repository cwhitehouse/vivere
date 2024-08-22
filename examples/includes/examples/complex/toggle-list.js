import { Component } from '../../../../src/vivere';

export default class extends Component {
  // ------------------------------------------------
  // DATA
  // ------------------------------------------------

  properties;

  // ------------------------------------------------
  // COMPUTED PROPERTIES
  // ------------------------------------------------

  get propertiesString() {
    const { properties } = this;
    return properties.join(' ,  ');
  }
}
