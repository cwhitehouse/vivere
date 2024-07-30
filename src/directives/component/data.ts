import jsep from 'jsep';
import type { ObjectExpression } from '@jsep-plugin/object';
import Evaluator from '../../lib/evaluator';
import RootDirective from './root';
import { StorageParams, useStorage } from '../../reactivity/storage';
import DirectiveError from '../../errors/directive-error';

enum DataType {
  Value,
  Object,
  Reference,
  Computation,
}

export default class DataDirective extends RootDirective {
  static id = 'data';

  static shortcut = '#';

  static shouldRehydrate = false;

  storageParams?: StorageParams;

  // Parsing

  preprocess(): void {
    const { camelKey, modifiers } = this;

    if (modifiers?.length) {
      // eslint-disable-next-line prefer-const
      let [storageKey, storageType] = modifiers;

      if (storageKey === 'store') {
        if (storageType == null) storageType = 'local';

        if (storageType !== 'local' && storageType !== 'session')
          throw new DirectiveError(`Unknown storage type: ${storageType}`, this);

        this.storageParams = { key: camelKey, type: storageType };
      } else
        throw new DirectiveError(`Unexpected modifier: ${storageKey}`, this);
    }
  }

  categorize(tree: jsep.Expression): DataType {
    const { type } = tree;

    switch (type) {
      case 'Literal':
      case 'Identifier':
        return DataType.Value;
      case 'ArrayExpression':
        return this.categorizeArray(tree as jsep.ArrayExpression);
      case 'ObjectExpression':
        return this.categorizeObject(tree as ObjectExpression);
      case 'MemberExpression':
        return DataType.Reference;
      default:
        return DataType.Computation;
    }
  }

  categorizeArray(tree: jsep.ArrayExpression): DataType {
    const types = tree.elements.map((e) => this.categorize(e));
    if (types.some((t) => t === DataType.Reference || t === DataType.Computation))
      return DataType.Computation;
    return DataType.Object;
  }

  categorizeObject(tree: ObjectExpression): DataType {
    const types = tree.properties.flatMap((p) => {
      const $types = [this.categorize(p.key)];
      if (p.value) $types.push(this.categorize(p.value));
      return $types;
    });
    if (types.some((t) => t === DataType.Reference || t === DataType.Computation))
      return DataType.Computation;
    return DataType.Object;
  }

  process(): void {
    const { component, camelKey, expression, storageParams } = this;

    if (!expression?.length) {
      component.$set(camelKey, null);
      return;
    }

    const tree = Evaluator.tree(expression);
    const type = this.categorize(tree);

    switch (type) {
      case DataType.Value:
        component.$set(camelKey, Evaluator.parsePrimitive(expression));
        break;
      case DataType.Object:
        component.$set(camelKey, Evaluator.parse(component, expression));
        break;
      case DataType.Reference:
        component.$proxy(camelKey, expression);
        break;
      default:
        // Other expressions are interpreted as computed properties
        component.$set(camelKey, null, () => Evaluator.compute(component, expression), null);
    }

    if (storageParams != null)
      if (type === DataType.Value || type === DataType.Object)
        useStorage(component, storageParams);
      else
        throw new DirectiveError('You cannot store passed or computed properties', this);
  }
}
