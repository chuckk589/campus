<template>
  <div class="d-flex justify-center">
    <v-btn
      density="compact"
      class="ma-2"
      variant="text"
      icon="mdi-pencil"
      @click="edit"
    ></v-btn>
  </div>
</template>

<script>
export default {
  name: 'AttemptCell',
  data() {
    return {};
  },
  methods: {
    edit() {
      this.$emitter.emit('openModal', {
        url: `/attempt/${this.params.data.id}`,
        method: 'PUT',
        header: `Попытка №${this.params.data.attemptId}`,
        eventName: 'edit-attempt',
        fields: [
          {
            key: 'status',
            label: 'Статус',
            type: 'select',
            value: this.params.data.status,
            options: this.$ctable.quiz_status,
          },
        ],
      });
    },
  },
};
</script>
