const State = {
  Show: 'show',
  Delete: 'delete',
};

export default {
  passed: {
    text: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      toDo: null,
      tags: null,
      state: State.Show,
      states: [State.Show],
    };
  },

  computed: {
    fauxState() {
      return this.states[0];
    },

    taggedUrgent() {
      return this.tags?.indexOf('urgent') >= 0;
    },

    taggedBlocked() {
      return this.tags?.indexOf('blocked') >= 0;
    },

    taggedNotifies() {
      return this.tags?.indexOf('notifies') >= 0;
    },

    lowerText() {
      const { text } = this;
      return text?.toLowerCase();
    },

    lowerLabel() {
      const { toDo } = this;
      const { label } = toDo;
      return label?.toLowerCase();
    },

    matchesText() {
      const { lowerText, lowerLabel } = this;

      if (lowerText == null || lowerText.length <= 0)
        return true;

      return lowerLabel.includes(lowerText);
    },

    isShowing() {
      return this.fauxState === State.Show;
    },

    isDeleting() {
      return this.fauxState === State.Delete;
    },
  },

  methods: {
    confirmDelete() {
      this.states.unshift(State.Delete);
    },

    delete() {
      this.$destroy();
    },

    reset() {
      this.states.unshift(State.Show);
    },
  },
};
