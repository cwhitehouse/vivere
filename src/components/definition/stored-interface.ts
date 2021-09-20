export default interface StoredInterface {
  type: string;
  default?: (string | number | boolean | (() => (string | number | boolean)));
  version?: number;
  modifier?: string;
}
