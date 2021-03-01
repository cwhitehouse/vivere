import ComponentContext from '../components/component-context';

const delayedHooks = [];
let chainReactions = 0;

export default {
  chanReactionStarted(): void {
    chainReactions += 1;
  },

  trackComponent(component: ComponentContext, hook: (newValue: unknown, oldValue: unknown) => void, newValue: unknown, oldValue: unknown): void {
    delayedHooks.push({
      component,
      hook,
      newValue,
      oldValue,
    });
  },

  chainReactionEnded(): void {
    chainReactions -= 1;

    while (chainReactions <= 0 && !!delayedHooks.length) {
      const entry = delayedHooks.shift();
      entry.hook(entry.newValue, entry.oldValue);
    }
  },
};
