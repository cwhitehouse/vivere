const State = {
  Show: 'show',
  Delete: 'delete',
};

export default {
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
