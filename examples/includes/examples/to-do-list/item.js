import { VivereComponent } from "../../../../src/vivere";

const State = {
  SHOW: 'show',
  DELETE: 'delete',
  EDIT: 'edit',
};

export default class extends VivereComponent {
  toDo = null;
  state = State.SHOW;
  label = null;

  $passed = {
    toDo: {
      default: {
        tags: [],
      },
    },
  };

  get isShowing() {
    return this.state === State.SHOW;
  }

  get isEditing() {
    return this.state === State.EDIT;
  }

  get hasLabel() {
    const { label } = this;
    return !!label;
  }

  get isDeleting() {
    return this.state === State.DELETE;
  }

  onIsEditingChanged() {
    if (this.isEditing) {
      this.label = this.toDo.label;
      this.$nextRender(() => {
        const input = this.$refs.input;
        if (input instanceof Element)
          input.focus();
      });
    }
  }

  startEditing() {
    this.state = State.EDIT;
  }

  save() {
    this.toDo.label = this.label;
    this.reset();
  }

  confirmDelete() {
    this.state = State.DELETE;
  }

  delete() {
    const { toDo } = this;
    this.$emit('remove', toDo);
  }

  reset() {
    this.state = State.SHOW;
  }
};
