import Component from '../components/component';

const delayedHooks: {
  component: Component;
  hook: (oldValue: unknown) => void;
  oldValue: unknown;
}[] = [];
let chainReactions = 0;

export default {
  chainReactionStarted(): void {
    chainReactions += 1;
  },

  trackComponent(
    component: Component,
    hook: (oldValue: unknown) => void,
    oldValue: unknown,
  ): void {
    delayedHooks.push({
      component,
      hook,
      oldValue,
    });
  },

  chainReactionEnded(): void {
    chainReactions -= 1;

    while (chainReactions <= 0 && !!delayedHooks.length) {
      const entry = delayedHooks.shift();
      entry.hook(entry.oldValue);
    }
  },
};
