let id = 4;

export default class {
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

  get filterBy() {
    const { filter } = this;

    switch (filter) {
      case 'urgent':
        return 'taggedUrgent';
      case 'blocked':
        return 'taggedBlocked';
      case 'notifies':
        return 'taggedNotifies';
      default:
        return 'matchesText';
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
        class="to-do-item h-12 flex items-stretch"
      >
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
          <div class="flex-1 flex items-center justify-end">
            <button
              v-disabled="toDo.checked"
              class="text-white bg-pink-600 px-3 py-2 rounded hover:shadow-md active:shadow-none disabled:opacity-50"
              v-event:click="confirmDelete"
            >Delete</button>
          </div>
        </div>
        <div
          v-if="isDeleting"
          class="flex items-center w-full"
        >
          <p class="flex-1 text-red-600">Are you sure you want to delete this?</p>
          <button
            class="text-white bg-pink-600 px-3 py-2 rounded hover:shadow-md active:shadow-none mr-2"
            v-event:click="delete"
          >Confirm</button>
          <button
            class="bg-gray-400 px-3 py-2 rounded hover:shadow-md active:shadow-none"
            v-event:click="reset"
          >Cancel</button>
        </div>
      </div>
    `;

    this.$attach(html, 'list');
  }
};
