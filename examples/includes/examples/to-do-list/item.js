import { VivereComponent } from "../../../../src/vivere";

const State = {
  SHOW: 'show',
  DELETE: 'delete',
  EDIT: 'edit',
};

export default class extends VivereComponent {
  text = null;
  toDo = null;
  state = State.SHOW;
  states = [State.SHOW];
  label = null;

  $passed = {
    text: {
      type: String,
    },
  };

  get fauxState() {
    return this.states[0];
  }

  get taggedUrgent() {
    const { toDo } = this;
    const { tags } = toDo;

    return tags?.indexOf('urgent') >= 0;
  }

  get taggedBlocked() {
    const { toDo } = this;
    const { tags } = toDo;

    return tags?.indexOf('blocked') >= 0;
  }

  get taggedNotifies() {
    const { toDo } = this;
    const { tags } = toDo;

    return tags?.indexOf('notifies') >= 0;
  }

  get lowerText() {
    const { text } = this;
    return text && text.toLowerCase();
  }

  get lowerLabel() {
    const { toDo } = this;
    const { label } = toDo;
    return label?.toLowerCase();
  }

  get matchesText() {
    const { lowerText, lowerLabel } = this;

    if (lowerText == null || lowerText.length <= 0)
      return true;

    return lowerLabel.includes(lowerText);
  }

  get isShowing() {
    return this.fauxState === State.SHOW;
  }

  get isEditing() {
    return this.fauxState === State.EDIT;
  }

  get hasLabel() {
    const { label } = this;
    return !!label;
  }

  get isDeleting() {
    return this.fauxState === State.DELETE;
  }

  onIsEditingChanged() {
    if (this.isEditing) {
      this.label = this.toDo.label;
      this.$nextRender(() => {
        this.$refs.input.focus();
      });
    }
  }

  startEditing() {
    this.states.unshift(State.EDIT);
  }

  save() {
    this.toDo.label = this.label;
    this.reset();
  }

  confirmDelete() {
    this.states.unshift(State.DELETE);
  }

  delete() {
    this.$destroy();
  }

  reset() {
    this.states.unshift(State.SHOW);
  }
};
