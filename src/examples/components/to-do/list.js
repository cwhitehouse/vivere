export default {
  data: {
    creating: false,
  },

  methods: {
    startCreating() {
      this.creating = true;
    },

    stopCreating() {
      this.creating = false;
    },

    create(label) {
      const html = `
        <div
          v-component="to-do-item"
          v-data:to-do='{ "id": 8, "label": "${label}" }'
          class="to-do-item h-12 flex items-stretch"
        >
          <div
            v-if="isShowing"
            class="flex items-center w-full"
          >
            <input
              type="checkbox"
              class="mr-2"
              v-sync="toDo.checked"
            ></input>
            <p
              class="flex-1"
              v-class:line-through="toDo.checked"
              v-class:italic="toDo.checked"
              v-text="toDo.label"
            ></p>
            <button
              v-disabled="toDo.checked"
              class="text-white bg-pink-600 px-3 py-2 rounded hover:shadow-md active:shadow-none disabled:opacity-50"
              v-click="confirmDelete"
            >Delete</button>
          </div>
          <div
            v-if="isDeleting"
            class="flex items-center w-full"
          >
            <p class="flex-1 text-red-600">Are you sure you want to delete this?</p>
            <button
              class="text-white bg-pink-600 px-3 py-2 rounded hover:shadow-md active:shadow-none mr-2"
              v-click="delete"
            >Confirm</button>
            <button
              class="bg-gray-400 px-3 py-2 rounded hover:shadow-md active:shadow-none"
              v-click="reset"
            >Cancel</button>
          </div>
        </div>
      `;

      this.$attach(html, 'list');
    },
  },
};
