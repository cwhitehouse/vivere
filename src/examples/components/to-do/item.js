const State = {
  Show: 'show',
  Delete: 'delete',
};

export default {
  data: {
    state: State.Show,
  },

  computed: {
    isShowing() {
      return this.state === State.Show;
    },

    isDeleting() {
      return this.state === State.Delete;
    },
  },

  methods: {
    confirmDelete() {
      this.state = State.Delete;
    },

    delete() {
      this.unmount();
    },

    reset() {
      this.state = State.Show;
    },
  },
};
