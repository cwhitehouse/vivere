import { VivereComponent } from "../../../../src/vivere";

const State = {
  SHOW: 'show',
  DELETE: 'delete',
  EDIT: 'edit',
};

export default class extends VivereComponent {
  text = null;
  filter = null;

  toDo = null;
  state = State.SHOW;
  label = null;

  $passed = {
    text: {
      default: null,
    },
    filter: {
      default: null,
    },
  };

  get shouldShow() {
    const { filter, taggedBlocked, taggedNotifies, taggedUrgent, matchesText } = this;

    switch (filter) {
      case 'urgent':
        return taggedUrgent && matchesText;
      case 'blocked':
        return taggedBlocked && matchesText;
      case 'notifies':
        return taggedNotifies && matchesText;
      default:
        return matchesText;
    };
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
    this.$destroy();
  }

  reset() {
    this.state = State.SHOW;
  }
};
