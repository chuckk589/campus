<template>
  <div class="d-flex justify-center">
    <v-btn
      density="compact"
      class="ma-2"
      variant="text"
      icon="mdi-account-cancel"
      @click="changeBanStatus"
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
    changeBanStatus() {
      this.$emitter.emit('openModal', {
        url: `/user/${this.params.data.id}`,
        method: 'PUT',
        header: this.params.data.name,
        eventName: 'edit-user',
        fields: [
          {
            key: 'isBanned',
            label: 'Заблокирован',
            type: 'select',
            value: this.params.data.isBanned === true,
            options: [
              {
                value: true,
                title: 'Да',
              },
              {
                value: false,
                title: 'Нет',
              },
            ],
          },
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
