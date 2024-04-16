import VivereComponent from '../components/vivere-component';

const delayedHooks: { component: VivereComponent, hook: (oldValue: unknown) => void, oldValue: unknown }[] = [];
let chainReactions = 0;

export default {
  chainReactionStarted(): void {
    chainReactions += 1;
  },

  trackComponent(component: VivereComponent, hook: (oldValue: unknown) => void, oldValue: unknown): void {
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
