const State = {
  Show: 'show',
  Edit: 'edit',
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

    isEditing() {
      return this.state === State.Edit;
    },

    isDeleting() {
      return this.state === State.Delete;
    },

    startEditing() {
      this.state = State.Edit;
    },

    edit() {
      this.reset();
    },

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
