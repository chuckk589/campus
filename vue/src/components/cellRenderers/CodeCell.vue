<template>
  <div>
    <v-btn
      density="compact"
      class="ma-2"
      variant="text"
      icon="mdi-pencil"
      @click="view"
    ></v-btn>
  </div>
</template>

<script>
export default {
  name: 'CodeCell',
  data() {
    return {};
  },
  methods: {
    view() {
      this.$emitter.emit('openModal', {
        url: `/code/${this.params.data.id}`,
        method: 'PUT',
        header: this.params.data.value,
        eventName: 'edit-code',
        fields: [
          {
            key: 'status',
            label: 'Статус',
            type: 'select',
            value: this.params.data.status,
            options: this.$ctable.code_status,
          },
        ],
      });
    },
  },
};
</script>
