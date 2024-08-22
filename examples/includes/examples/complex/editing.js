import { Component } from '../../../../src/vivere';

export default class extends Component {
  // ------------------------------------------------
  // DATA
  // ------------------------------------------------

  item = null;

  editItem = null;

  editing = false;

  tagging = false;

  tag = null;

  // ------------------------------------------------
  // WATCHERS
  // ------------------------------------------------

  onEditingChanged() {
    const { editing, item } = this;

    if (editing) {
      // We need to deep copy this object, so we can
      // sync values without saving
      const meta = { ...item.meta };
      const tags = [...item.tags];
      this.editItem = {
        ...item,
        meta,
        tags,
      };
    }
  }

  onTaggingChanged() {
    const { $refs, tagging } = this;
    const { tagInput } = $refs;

    if (tagging)
      this.$nextRender(() => {
        if (tagInput instanceof HTMLInputElement) tagInput.focus();
      });
    else this.tag = null;
  }

  // ------------------------------------------------
  // METHODS
  // ------------------------------------------------

  save() {
    const { editItem } = this;

    const meta = { ...editItem.meta };
    const tags = [...editItem.tags];
    this.item = {
      ...editItem,
      meta,
      tags,
    };

    this.editing = false;
  }

  confirmTag() {
    const { editItem, tag } = this;
    const { tags } = editItem;

    tags.push(tag);
    this.tag = null;
  }

  removeTag(tag) {
    const { editItem } = this;
    const { tags } = editItem;

    const idx = tags.indexOf(tag);
    if (idx >= 0) tags.splice(idx, 1);
  }
}
