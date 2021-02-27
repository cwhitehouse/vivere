const State = {
  SHOW: 'show',
  DELETE: 'delete',
  EDIT: 'edit',
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
      state: State.SHOW,
      states: [State.SHOW],
      label: null,
    };
  },

  computed: {
    fauxState() {
      return this.states[0];
    },

    taggedUrgent() {
      const { toDo } = this;
      const { tags } = toDo;

      return tags?.indexOf('urgent') >= 0;
    },

    taggedBlocked() {
      const { toDo } = this;
      const { tags } = toDo;

      return tags?.indexOf('blocked') >= 0;
    },

    taggedNotifies() {
      const { toDo } = this;
      const { tags } = toDo;

      return tags?.indexOf('notifies') >= 0;
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
      return this.fauxState === State.SHOW;
    },

    isEditing() {
      return this.fauxState === State.EDIT;
    },

    hasLabel() {
      const { label } = this;
      return !!label;
    },

    isDeleting() {
      return this.fauxState === State.DELETE;
    },
  },

  methods: {
    startEditing() {
      this.states.unshift(State.EDIT);
    },

    save() {
      this.toDo.label = this.label;
      this.reset();
    },

    confirmDelete() {
      this.states.unshift(State.DELETE);
    },

    delete() {
      this.$destroy();
    },

    reset() {
      this.states.unshift(State.SHOW);
    },
  },

  watch: {
    isEditing() {
      if (this.isEditing) {
        this.label = this.toDo.label;
        this.$nextRender(() => {
          this.$refs.input.focus();
        });
      }
    },
  },
};
