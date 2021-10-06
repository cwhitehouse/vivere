import { VivereComponent } from "../../../../src/vivere";

let id = 4;

export default class extends VivereComponent {
  creating = false;
  filter = null;
  sort = null;
  text = null;

  get orderBy() {
    const { sort } = this;

    switch (sort) {
      case 'alphaAsc':
        return [['toDo.label'], ['asc']];
      case 'alphaDesc':
        return [['toDo.label'], ['desc']];
      default:
        return [['toDo.id'], ['asc']];
    };
  }

  get filtering() {
    const { filter } = this;
    return filter != null
      && filter.length > 0;
  }

  onFilterChanged() {
    if (this.filter != null)
        this.text = null;
  }

  startCreating() {
    this.creating = true;
  }

  stopCreating() {
    this.creating = false;
  }

  updateText(text) {
    this.text = text;
  }

  create(label) {
    id += 1;

    const html = `
      <div
        v-component="to-do-item"
        v-data:to-do='{ "id": ${id}, "label": "${label}" }'
        v-pass:text
        v-pass:filter
        v-if="shouldShow"
        class="to-do-item h-12 flex items-stretch"
      >
        <!-- MODE = EDITING -->
        <div
          v-if="isEditing"
          class="flex items-center w-full space-x-2"
        >
          <input
            type="text"
            class="flex-1"
            placeholder="Edit label..."
            v-sync="label"
            v-ref="input"
            v-event:keydown.ent="save"
            v-event:keydown.esc="reset"
          ></input>
          <button
            class="button-indigo"
            v-event:click="save"
            v-disabled="!hasLabel"
          >Save</button>
          <button
            class="button"
            v-event:click="reset"
          >Cancel</button>
        </div>


        <!-- MODE = SHOW -->
        <div
          v-if="isShowing"
          class="flex items-center w-full"
        >
          <div class="flex-2 flex items-center">
            <input
              type="checkbox"
              class="mr-2"
              v-sync="toDo.checked"
            ></input>
            <p
              class="flex-2"
              v-class:line-through="toDo.checked"
              v-class:italic="toDo.checked"
              v-text="toDo.label"
            ></p>
          </div>
          <div class="to-do-tags flex-1 flex items-center">
          </div>
          <div class="flex-1 flex items-center justify-end space-x-2">
            <button
              v-disabled="toDo.checked"
              class="button"
              v-event:click="startEditing"
            >Edit</button>
            <button
              v-disabled="toDo.checked"
              class="button-rosy"
              v-event:click="confirmDelete"
            >Delete</button>
          </div>
        </div>


        <!-- MODE = DELETING -->
        <div
          v-if="isDeleting"
          class="flex items-center w-full"
          hidden
        >
          <p class="flex-1 text-rose-600">Are you sure you want to delete this?</p>
          <button
            class="button-rose mr-2"
            v-event:click="delete"
          >Confirm</button>
          <button
            class="button"
            v-event:click="reset"
          >Cancel</button>
        </div>
      </div>
    `;

    this.$attach(html, 'list');
  }
};
