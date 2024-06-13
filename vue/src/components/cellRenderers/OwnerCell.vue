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
  name: 'OwnerCell',
  data() {
    return {};
  },
  methods: {
    edit() {
      this.$emitter.emit('openModal', {
        url: `/owner/${this.params.data.id}`,
        method: 'PUT',
        header: `Редактирование пользователя ${this.params.data.username}`,
        eventName: 'edit-owner',
        fields: [
          {
            key: 'role',
            label: 'Роль',
            type: 'select',
            value: this.params.data.role,
            options: this.$ctable.owner_role,
          },
          {
            key: 'email',
            label: 'Email',
            type: 'text',
            value: this.params.data.email,
          },
          {
            key: 'credentials',
            label: 'ФИО',
            type: 'text',
            value: this.params.data.credentials,
          },
          {
            key: 'permissions',
            label: 'Права',
            type: 'chips',
            value: this.params.data.permissions.map((p) => p.id),
          },
          {
            key: 'password',
            label: 'Пароль',
            type: 'password',
            value: '',
          },
        ],
      });
    },
  },
};
</script>
