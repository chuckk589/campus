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
  name: 'BanCell',
  data() {
    return {};
  },
  methods: {
    edit() {
      this.$emitter.emit('openModal', {
        url: `/restriction/${this.params.data.id}`,
        method: 'PUT',
        header: this.params.data.userId,
        eventName: 'edit-restriction',
        fields: [
          {
            key: 'reason',
            label: 'Комментарий',
            value: this.params.data.reason,
          },
        ],
      });
    },
  },
};
</script>
