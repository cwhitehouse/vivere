import jsep from 'jsep';
import type { ObjectExpression } from '@jsep-plugin/object';
import Evaluator from '../../lib/evaluator';
import RootDirective from './root';

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

  // Parsing

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
    const { component, camelKey, expression } = this;

    if (!expression?.length) {
      component.$set(camelKey, null);
      return;
    }

    console.log('DataDirective#process');
    console.log(`  - key = ${camelKey}`);
    console.log(`  - exp = ${expression}`);

    const tree = Evaluator.tree(expression);
    const type = this.categorize(tree);
    console.log(`  - typ = ${type}`);

    switch (type) {
      case DataType.Value:
        console.log('  - component.$set(key, parsePrimitive)');
        component.$set(camelKey, Evaluator.parsePrimitive(expression));
        break;
      case DataType.Object:
        console.log('  - component.$set(key, parse)');
        component.$set(camelKey, Evaluator.parse(component, expression));
        break;
      case DataType.Reference:
        console.log('  - component.$proxy(key, expression)');
        component.$proxy(camelKey, expression);
        break;
      default:
        console.log('  - component.$set(key, () => compute)');
        // Other expressions are interpreted as computed properties
        component.$set(camelKey, null, () => Evaluator.compute(component, expression), null);
    }
  }
}
