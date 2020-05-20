const State = {
  Show: 'show',
  Delete: 'delete',
};

export default {
  data() {
    return {
      state: State.Show,
      states: [State.Show],
    };
  },

  computed: {
    fauxState() {
      return this.states[0];
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
