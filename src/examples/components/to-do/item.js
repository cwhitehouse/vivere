const State = {
  Show: 'show',
  Delete: 'delete',
};

export default {
  data: {
    state: State.Show,
  },

  methods: {
    isShowing() {
      return this.state === State.Show;
    },

    confirmDelete() {
      this.state = State.Delete;
    },

    isDeleting() {
      return this.state === State.Delete;
    },

    delete() {
      this.unmount();
    },

    reset() {
      this.state = State.Show;
    },
  },
};
