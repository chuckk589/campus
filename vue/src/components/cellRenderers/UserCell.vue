<template>
  <div class="d-flex justify-center">
    <v-btn
      density="compact"
      class="ma-2"
      variant="text"
      icon="mdi-account-cancel"
      @click="banUser"
    ></v-btn>
  </div>
</template>

<script>
export default {
  name: 'UserCell',
  data() {
    return {};
  },
  methods: {
    banUser() {
      this.$emitter.emit('openModal', {
        url: `/user/benned/${this.params.data.id}`,
        method: 'POST',
        header: this.params.data.name,
        eventName: 'edit-user',
        fields: [
          {
            key: 'banReason',
            label: 'Комментарий',
            value: this.params.data.banReason,
          },
        ],
      });
    },
  },
};
</script>
